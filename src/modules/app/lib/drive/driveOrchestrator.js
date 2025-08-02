import dataManagerSubdocs from "../dataSubDoc";
import persistenceManagerForSubdocs from "../persistenceSubDocs";
import DriveManager from "./drive";
import { googleDriveProvider } from "./provider";

class DriveOrchestrator {
    /**
     * Initializes a new instance of the class.
     * 
     * @constructor
     * @description
     * Creates a new Map to store drive managers, where each key is a drive name and the value is a DriveManager instance.
     */
    constructor() {
        /**
         * @type {Map<string, DriveManager>}
         */
        this.managers = new Map(); // driveName -> DriveManager
    }

    registerProvider(driveName, providerImpl) {
        const manager = new DriveManager(driveName, providerImpl);
        this.managers.set(driveName, manager);
        return manager;
    }

    getManager(driveName) {
        return this.managers.get(driveName);
    }

    async startSyncForAllDriveDocs(driveName, interval) {
        const manager = this.managers.get(driveName);
        if (!manager) throw new Error(`Manager for ${driveName} not found`);

        const docIds = await manager.fetchAllDriveDocIds();

        console.log("ALL DOCS IN GOOGLE DRIVE: ", docIds);

        for (const docId of docIds.map(value => value.name)) {
            if (typeof docId !== "string") {
                console.warn(`docId is not a string:`, docId);
                continue;
            }

            let ydoc = dataManagerSubdocs.getLibrary(docId);

            if (!ydoc) {
                await dataManagerSubdocs.initLibrary(docId);
                ydoc = dataManagerSubdocs.getLibrary(docId);

                console.log("ydoc iin startSyncForAllDriveDocs", ydoc);

                await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(
                    ydoc
                );
                await manager.addDocument(docId, ydoc, ydoc.clientID, docId);

                await manager.startSync(docId, interval);
            }
        }
    }

    async startSync(driveName, docId, interval) {
        const manager = this.managers.get(driveName);
        if (!manager) throw new Error(`Manager for ${driveName} not found`);
        await manager.startSync(docId, interval);
    }

    stopSync(driveName) {
        const manager = this.managers.get(driveName);
        if (manager.syncActive) {
            if (manager) manager.stopSyncForAllDocs();
        }
    }
}

const driveOrchestrator = new DriveOrchestrator();

driveOrchestrator.registerProvider('googleDrive', googleDriveProvider);

export default driveOrchestrator;