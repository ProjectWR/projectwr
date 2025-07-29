class DriveManager {
    constructor(driveName, providerImpl) {
        this.driveName = driveName;
        this.ydocs = new Map(); // docId -> { ydoc, clientId, folderId, state }
        this.provider = providerImpl;
    }

    async initDriveSync() {
        await this.provider.init();
    }

    async addDocument(docId, ydoc, clientId, folderId) {
        const state = {
            ydoc,
            clientId,
            folderId,
            lastKnownVector: Y.encodeStateVector(ydoc),
            processedUpdates: new Set(),
            syncInterval: null
        };
        this.ydocs.set(docId, state);
    }

    async startSync(docId, interval = 5000) {
        const state = this.ydocs.get(docId);
        if (!state) throw new Error(`Document ${docId} not found`);

        await this.provider.init();

        // Initial sync
        await this.pullChanges(docId);

        // Start periodic sync
        state.syncInterval = setInterval(async () => {
            await this.pullChanges(docId);
            await this.pushChanges(docId);
        }, interval);
    }

    stopSync(docId) {
        const state = this.ydocs.get(docId);
        if (state?.syncInterval) {
            clearInterval(state.syncInterval);
            state.syncInterval = null;
        }
    }

    async pushChanges(docId) {
        const state = this.ydocs.get(docId);
        if (!state) return;

        const { ydoc, lastKnownVector, clientId, folderId } = state;
        const update = Y.encodeStateAsUpdate(ydoc, lastKnownVector);

        if (update.length === 0) return; // No changes

        // Upload update and state vector
        const timestamp = new Date().toISOString();
        await this.provider.uploadFile(folderId, `update_${clientId}_${timestamp}.bin`, update);

        const newVector = Y.encodeStateVector(ydoc);
        await this.provider.uploadFile(folderId, `${clientId}_state_vector.bin`, newVector);

        // Update local state
        state.lastKnownVector = newVector;
    }

    async pullChanges(docId) {
        const state = this.ydocs.get(docId);
        if (!state) return;

        const { ydoc, clientId, folderId, processedUpdates } = state;
        const files = await this.provider.listFolder(folderId);

        // Process state vectors first
        const serverVectors = {};
        for (const file of files) {
            if (file.name.endsWith('_state_vector.bin')) {
                const client = file.name.split('_')[0];
                serverVectors[client] = await this.provider.downloadFile(file.id);
            }
        }

        // Apply new updates
        for (const file of files) {
            if (!file.name.startsWith('update_') || processedUpdates.has(file.id)) continue;

            const update = await this.provider.downloadFile(file.id);
            Y.applyUpdate(ydoc, update, clientId);
            processedUpdates.add(file.id);
        }

        // Update to latest known state
        const latestVector = this.findDominantVector(serverVectors);
        if (latestVector) {
            state.lastKnownVector = latestVector;
        }
    }

    findDominantVector(vectors) {
        // Implementation to find the most recent vector
        // Could compare timestamps or use vector clock logic
        return Object.values(vectors).sort((a, b) =>
            b.timestamp - a.timestamp
        )[0];
    }
}

export default DriveManager;