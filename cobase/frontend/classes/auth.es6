
export class User{
    constructor(options){
        if(options){
            for(let key of Object.keys(options)){
                this[key] = options[key]
            }
        }
        if(this.id){
            //console.log(this)
        }
    }

    checkCompanyRole(role){
        return this.company && this.company.user.role == role
    }

    isGuest(){
        return !this
    }

    getCompany(){
        if(!this){
            return null
        }
        return this.company
    }

    isAuthorized(){
        return typeof(this) !='undefined'
    }

    inGroup(group){
        return this && this.groups && this.groups.indexOf(group) != -1
    }

    getVar(category, categoryVar=null){
        if(this.isGuest()){
            return null
        }
        var data = this[category]
        if(typeof data == 'undefined'){
            return null
        }
        if(!categoryVar){
            return data
        }
        return data[categoryVar]
    }

    checkPermission(category, name, value){
        var self = this
        var permissions = self.getVar(category, 'permissions')
        if(!permissions){
            return false
        }
        var permission = permissions[name]
        return permission.indexOf(value) != -1
    }
}
