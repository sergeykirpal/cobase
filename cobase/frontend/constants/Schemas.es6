import { normalize, Schema, arrayOf } from 'normalizr';

let project = new Schema('projects', { idAttribute: 'guid' });
let projectTask = new Schema('tasks', { idAttribute: 'guid' });

export const projectSchema = project;
export const projectTaskSchema = projectTask;
