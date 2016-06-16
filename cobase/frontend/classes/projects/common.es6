export class Project {
    constructor(data) {
        if(data){
            for(let key of Object.keys(data)){
                this[key] = data[key]
            }
        }
    }

    getUsers(role='all'){
        var data = []
        var allUsers = role == 'all'

        if(allUsers || role == 'director'){
            if(this.users && this.users.directors){
                data = this.users.directors
            }
        }

        if(allUsers || role == 'manager'){
            if(this.users && this.users.managers){
                data = data.concat(this.users.managers)
            }
        }

        if(allUsers || role == 'worker'){
            if(this.users && this.users.workers){
                data = data.concat(this.users.workers)
            }
        }

        return data
    }

    getUsersObject(role='all'){
        var users = this.getUsers()
        var obj = {}
        for(let userLink of users){
            obj[userLink.user_id] = userLink
        }
        return obj
    }

    getUser(userId, role='all'){
        for(let userLink of this.getUsers(role)){
            if(userLink.user.id == userId){
                return userLink
            }
        }

        return null
    }

    checkUserRole(userId, role){
        for(let userLink of this.getUsers()){
            if(userLink.user.id == userId){
                return userLink.role == role
            }
        }
        return false
    }

    getUserRole(userId){
        for(let userLink of this.getUsers()){
            if(userLink.user.id == userId){
                return userLink.role
            }
        }
        return null
    }

    checkStatusForUser(userId, status){
        for(let userLink of this.getUsers()){
            if(userLink.user.id == userId){
                return userLink.status == status
            }
        }
        return false
    }

    statusForUser(userId){
        for(let userLink of this.getUsers()){
            if(userLink.user.id == userId){
                return userLink.status
            }
        }
        return null
    }

    isActiveForUser(userId){
        return this.statusForUser(userId) == 'active'
    }
}

export class ProjectTask {
    constructor(data) {
        if(data){
            for(let key of Object.keys(data)){
                this[key] = data[key]
            }
        }
    }

    hasUser(userId, type='all'){
        return Boolean(this.getUser(userId, type))
    }

    getUsers(types='all'){
        var allUsers = types == 'all'
        var data = []

        if(typeof types == 'string'){
            types = [types]
        }

        if(allUsers || types.indexOf('task') != -1){
            if(this.users && this.users.task){
                data = this.users.task
            }
        }

        if(allUsers || types.indexOf('info') != -1){
            if(this.users && this.users.info){
                data = data.concat(this.users.info)
            }
        }

        if(allUsers || types.indexOf('stat') != -1){
            if(this.users && this.users.stat){
                data = data.concat(this.users.stat)
            }
        }

        return data
    }

    getUserIds(types='all'){
        var ids = []

        for(let userLink of this.getUsers(types)){
            ids.push(userLink.user.id)
        }
        return ids
    }

    getUser(userId, type='all'){
        for(let userLink of this.getUsers(type)){
            if(userLink.user_id == userId){
                return userLink
            }
        }
        return null;
    }

    isDeleted(){
        return (typeof this.deleted == 'undefined') || this.deleted
    }

    hasCoords(){
        return Boolean(this.coordinates)
    }

    membersString(){
        if(this.alert_type == 'global'){
            return 'All'
        }
        var str = ''
        for(let userLink of this.getUsers('task')){
            str += `${userLink.user.name}, `
        }

        return str.length > 0 ? str.slice(0, -2) : str
    }

    isEditableForUser(userId){
        return this.owner_id == userId
    }

    isForwarded(userId){
        return this.child && this.child.owner_id == userId
    }

    isUnreadForUser(userId){
        var userLink = this.getUser(userId)
        return userLink ? !Boolean(userLink.read) : false
    }
}