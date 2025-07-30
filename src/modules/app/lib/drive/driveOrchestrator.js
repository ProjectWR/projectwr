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

    async startSync(driveName, docId, interval) {
        const manager = this.managers.get(driveName);
        if (!manager) throw new Error(`Manager for ${driveName} not found`);
        await manager.startSync(docId, interval);
    }

    stopSync(driveName, docId) {
        const manager = this.managers.get(driveName);
        if (manager) manager.stopSync(docId);
    }
}

const driveOrchestrator = new DriveOrchestrator();

driveOrchestrator.registerProvider('googleDrive', googleDriveProvider);

export default driveOrchestrator;