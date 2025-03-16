import { v4 as uuidv4 } from 'uuid';

let instance;

class TemplateManager {
  constructor() {
    if (instance) {
      throw new Error("TemplateManager is a singleton class. Use getInstance() instead.");
    }

    this.callbacks = new Set(); // Array to store callbacks
    this.storageKey = 'templates'; // Key for localStorage
    instance = this;
  }

  // Add a callback
  addCallback(callback) {
    this.callbacks.add(callback);
  }

  // Remove a callback
  removeCallback(callback) {
    this.callbacks.delete(callback)
  }

  // Trigger all registered callbacks
  _triggerCallbacks(eventType, template) {
    this.callbacks.forEach(callback => callback(eventType, template));
  }

  // Get all templates from localStorage
  getTemplates() {
    const templates = localStorage.getItem(this.storageKey);
    return templates ? JSON.parse(templates) : {};
  }

  // Save templates to localStorage
  _saveTemplates(templates) {
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
  }

  // Create a new template
  createTemplate(templateProps) {
    const templates = this.getTemplates();
    const uuid = uuidv4(); // Generate a UUID
    templates[uuid] = { ...templateProps, template_id: uuid }; // Add the template with its UUID
    this._saveTemplates(templates); // Save to localStorage
    this._triggerCallbacks('added', templates[uuid]); // Notify callbacks
    return uuid;
  }

  // Delete a template by UUID
  deleteTemplate(uuid) {
    const templates = this.getTemplates();
    if (templates[uuid]) {
      const deletedTemplate = templates[uuid];
      delete templates[uuid]; // Remove the template
      this._saveTemplates(templates); // Save to localStorage
      this._triggerCallbacks('removed', deletedTemplate); // Notify callbacks

    }
    throw new Error(`[template] Template with UUID ${uuid} not found`);
  }

  // Update a template by UUID
  updateTemplate(uuid, updatedProps) {
    const templates = this.getTemplates();
    console.log(templates);
    if (templates[uuid]) {
      templates[uuid] = { ...templates[uuid], ...updatedProps }; // Update the template
      this._saveTemplates(templates); // Save to localStorage
      this._triggerCallbacks('updated', templates[uuid]); // Notify callbacks
    }
    else {
      throw new Error(`[template] Template with UUID ${uuid} not found`);
    }
  }
}

const templateManager = Object.freeze(new TemplateManager());

export default templateManager;