import * as Y from "yjs";

class DriveManager {
    constructor(driveName, providerImpl) {
        this.driveName = driveName;
        this.ydocs = new Map(); // docId -> { ydoc, clientId, folderId }
        this.provider = providerImpl;
        this.rootFolderName = "CalamusApp";
    }

    async initDriveSync() {
        await this.provider.init();
        await this.findOrCreateFolder(this.rootFolderName);
        return true;
    }

    async fetchAllDriveDocIds() {
        const docIds = await this.provider.listFoldersInFolder(this.rootFolderName);
        return docIds;
    }

    async setupDocumentFolder(docId, folderName) {
        const rootFolder = await this.findOrCreateFolder(this.rootFolderName);
        const docFolder = await this.findOrCreateFolder(folderName || docId, rootFolder.id);
        return docFolder.id;
    }

    async findOrCreateFolder(folderName, parentId = null) {
        const folders = await this.provider.listFolder(parentId || "root");
        const existingFolder = folders?.find(f => f.name === folderName);
        return existingFolder || await this.provider.createFolder(folderName, parentId);
    }

    async addDocument(docId, ydoc, clientId, folderName) {
        const folderId = await this.setupDocumentFolder(docId, folderName);
        this.ydocs.set(docId, { ydoc, clientId, folderId });
        return folderId;
    }

    async startSync(docId, interval = 5000) {
        const state = this.ydocs.get(docId);
        if (!state) throw new Error(`Document ${docId} not found`);

        // Initial sync
        await this.syncDocument(docId);

        // Setup periodic sync
        state.syncInterval = setInterval(async () => {
            console.log("SYNCING GOOGLE DRIVE: ", docId);

            await this.syncDocument(docId);
        }, interval);
    }

    async syncDocument(docId) {
        const state = this.ydocs.get(docId);
        if (!state) return;

        const { ydoc, clientId, folderId } = state;

        // 1. Download all cloud updates
        const cloudUpdates = await this.downloadCloudUpdates(folderId);

        if (cloudUpdates.length > 0) {
            // 2. Apply cloud updates to local document
            Y.applyUpdate(ydoc, Y.mergeUpdates(cloudUpdates));

            // 3. Create temporary cloud document
            const cloudDoc = new Y.Doc();
            Y.applyUpdate(cloudDoc, Y.mergeUpdates(cloudUpdates));

            // 4. Get state vectors for comparison
            const cloudVector = Y.encodeStateVector(cloudDoc);
            const localVector = Y.encodeStateVector(ydoc);

            // 5. Check if there are actual changes
            if (!this.areStateVectorsEqual(cloudVector, localVector)) {
                console.log("CHANGES DETECTED FOR, UPLOADING!: ", docId);
                const localDiff = Y.encodeStateAsUpdate(ydoc, cloudVector);
                await this.uploadUpdate(folderId, clientId, localDiff);
            } else {
                console.log("No local changes to upload for", docId);
            }

            Y.applyUpdate(ydoc, Y.mergeUpdates(cloudUpdates));

            // Clean up temporary document
            cloudDoc.destroy();
        } else {
            // 6. For new documents, upload full state if not empty
            const currentVector = Y.encodeStateVector(ydoc);
            if (!this.isZeroVector(currentVector)) {
                const fullState = Y.encodeStateAsUpdate(ydoc);
                await this.uploadUpdate(folderId, clientId, fullState);
            }
        }
    }


    async downloadCloudUpdates(folderId) {
        const files = await this.provider.listFolder(folderId);
        const updates = [];

        for (const file of files) {
            if (file.name.startsWith('update_')) {
                try {
                    const update = await this.provider.downloadFile(file.id);
                    updates.push(update);
                } catch (error) {
                    console.error("Error downloading update:", error);
                }
            }
        }

        return updates;
    }

    async uploadUpdate(folderId, clientId, update) {
        const timestamp = Date.now();
        await this.provider.uploadFile(
            folderId,
            `update_${clientId}_${timestamp}.bin`,
            update
        );
    }

    stopSync(docId) {
        const state = this.ydocs.get(docId);
        if (state?.syncInterval) {
            clearInterval(state.syncInterval);
            state.syncInterval = null;
        }
    }

    // Helper function to compare state vectors
    areStateVectorsEqual(vec1, vec2) {
        if (!vec1 || !vec2) return false;
        if (vec1.byteLength !== vec2.byteLength) return false;
        for (let i = 0; i < vec1.byteLength; i++) {
            if (vec1[i] !== vec2[i]) return false;
        }
        return true;
    }

    // Check if state vector represents an empty document
    isZeroVector(vector) {
        if (!vector) return true;
        for (let i = 0; i < vector.byteLength; i++) {
            if (vector[i] !== 0) return false;
        }
        return true;
    }
}

export default DriveManager;