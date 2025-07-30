import { oauthStore } from "../../stores/oauthStore";
import axios from "axios";

export const googleDriveProvider = {
    init: async () => {
        const token = oauthStore.getState()?.accessTokenState;
        if (!token) {
            console.error("Not logged into Google Drive");
            throw new Error("Tried initiating provider before logging into Google Drive")
        }
        return;
    },

    listFolder: async (folderId = "root") => {
        const token = oauthStore.getState()?.accessTokenState;
        if (!token) return null;

        try {
            const response = await axios.get(
                'https://www.googleapis.com/drive/v3/files',
                {
                    params: {
                        q: `'${folderId}' in parents and trashed=false`,
                        fields: 'files(id, name, mimeType, modifiedTime)'
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.files;
        } catch (error) {
            console.error("Error listing folder:", error.response?.data || error.message);
            return null;
        }
    },

    createFolder: async (folderName, parentId = "root") => {
        const token = oauthStore.getState()?.accessTokenState;
        if (!token) return null;

        try {
            const metadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };

            const response = await axios.post(
                'https://www.googleapis.com/drive/v3/files',
                metadata,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating folder:", error.response?.data || error.message);
            return null;
        }
    },

    uploadFile: async (folderId, name, data) => {
        const token = oauthStore.getState()?.accessTokenState;
        if (!token) return null;

        try {
            // Create file metadata
            const metadata = {
                name,
                parents: [folderId]
            };

            // Create multipart request
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([data], { type: 'application/octet-stream' }));

            const response = await axios.post(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/related'
                    }
                }
            );
            return response.data.id;
        } catch (error) {
            console.error("Error uploading file:", error.response?.data || error.message);
            return null;
        }
    },

    downloadFile: async (fileId) => {
        const token = oauthStore.getState()?.accessTokenState;
        if (!token) return null;

        try {
            const response = await axios.get(
                `https://www.googleapis.com/drive/v3/files/${fileId}`,
                {
                    params: { alt: 'media' },
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'arraybuffer'
                }
            );
            return new Uint8Array(response.data);
        } catch (error) {
            console.error("Error downloading file:", error.response?.data || error.message);
            return null;
        }
    }
};