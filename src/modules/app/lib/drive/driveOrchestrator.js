import DriveManager from "./drive";
import { googleDriveProvider } from "./provider";

class DriveOrchestrator {
    constructor() {
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
const googleManager = driveOrchestrator.registerProvider('googleDrive', googleDriveProvider);
