export const AUTH_USER_BASE_FIELDS = ['company', 'thumbs', 'subscription', 'projectstasks', 'chat', 'projectsuserlogs']
export const AUTH_USER_IMAGE_UPLOAD_LIMITATIONS = {
    accept_file_types: /(\.|\/)(jpe?g|png|pdf)$/i,
    accept_file_extensions: /(\.jpg|\.jpeg|\.png|\.pdf)$/i,
    max_file_size:45* 1024 * 1024
}

export const SITE_NAME = 'CoBase'
export const HOST_NAME = location.hostname.split(':')[0]
export const WEBSOCKETS_URL = `//${HOST_NAME}:8080/main`
export const PROJECTS_PROJECT_TASK_UPLOAD_LIMITATIONS = {
    accept_file_types: /(\.|\/)(jpe?g|png|pdf)$/i,
    accept_file_extensions: /(\.jpg|\.jpeg|\.png|\.pdf)$/i,
    max_file_size:45* 1024 * 1024
}
export const PROJECTS_PROJECT_DRAWING_UPLOAD_LIMITATIONS = {
    accept_file_types: /(\.|\/)(jpe?g|png|pdf)$/i,
    accept_file_extensions: /(\.jpg|\.jpeg|\.png|\.pdf)$/i,
    max_file_size:45* 1024 * 1024
}
export const PROJECTS_ACTIVE_PROJECT_FIELDS = 'users,retrieved,access,companyusers'
export const PROJECTS_ACTIVE_PROJECT_TASK_ITEM_FIELDS = 'users,image_guid,has_child,target_user_id'
