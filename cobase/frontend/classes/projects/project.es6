import {ProjectsUrls, AuthUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest} from 'utils/api.es6'
import * as config from 'constants/Config.es6';
import {activeProjectUpdated, activeProjectCompanyUsersChanged} from 'actions/projects.es6'
import {Project} from 'classes/projects/common.es6'
import {changeLocation} from 'actions/site.es6'
import {isDateFieldSupported, isTimeFieldSupported} from 'utils/date.es6'
import {isMobile} from 'utils/environment.es6'
import {extractEmail} from 'utils/string.es6'
import {Geolocation} from 'utils/geolocation.es6'
var moment = require('moment');


export class ProjectAccessManager{
    constructor(options) {
        this.dispatch = options.dispatch
        this.project = options.project
        this.access = options.access
        this.$box = $(options.box)
        this.userEmails = {}
    }

    run(){
        var self = this
        self.bindButtons()
        self.renderAccessUsers()
    }

    getFormData(users = []){
        var $accessUsers = this.$box.find('.project-access-user')
        $accessUsers.each(function(k,accessUser){
            var $accessUser = $(accessUser)
            var checked = $accessUser.find('input[type=checkbox]').prop('checked')
            if(checked){
                users.push({name: $accessUser.find('.user-name').text(), email: $accessUser.find('.user-email').text()})
            }
        })
        return {'jssid': '1234', 'access_user': users.length ? users : ''}
    }

    renderAccessUsers(){
        var self = this
        for(let link of self.access){
            var $accessUser = this.renderAccessUser(link.user.name, link.user.email, link.user_id)
            this.$box.find('.project-access-users-box').prepend($accessUser)
            self.userEmails[link.user.email] = link.user.name
        }
        this.toggleUsersBox()
    }

    toggleUsersBox() {
        var self = this
        var usersExist = Object.keys(self.userEmails).length !== 0
        this.$box.find('.project-access-users').toggle(usersExist)
    }

    renderAccessUser(name, email, id){
        var self = this
        var $user = $($('#project-access-user-template').render({name:name, email:email, id: id}))
        return $user
    }

    bindButtons(){
        var self = this
        this.$box.find('form').validator({
            custom:{
                uniqueemail: function($el){
                    var email = $el.val().replace(/ /g, "").toLowerCase();
                    var $emails = self.$box.find('.project-access-user .user-email')
                    var emails = []
                    $emails.each(function (k, v) {
                        emails.push($(v).text().replace(/ /g, "").toLowerCase())
                    })
                    return emails.indexOf(email) == -1
                }
            },
            errors: {uniqueemail: true}
        }).on('submit', (e) => {
            if (e.isDefaultPrevented()) {
                return false
            }

            var data = this.getFormData()
            var url = `${ProjectsUrls.api.project(self.project.id)}?fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`
            PUTRequest(url, data, (project) => {
                project = new Project(project)
                self.dispatch(activeProjectUpdated(project))
                appHistory.goBack()
            })
            return false
        })

        this.$box.find('.add-project-access-user-btn')
            .click(function () {
                var $email = self.$box.find('.project-access-add-user-email')
                var $name = self.$box.find('.project-access-add-user-name')

                var email = $email.val().trim()
                var id = $email.data('userid')
                if(!id)id = 0
                var name = $name.val().trim()

                var $error = self.$box.find('.help-block')
                var error = $error.html()
                var url = `${ProjectsUrls.api.project(self.project.id)}?fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`
                if(email.length && !error.length){
                    var data = self.getFormData([{name: name, email:email}])
                    PUTRequest(url, data, (project) => {
                        project = new Project(project)
                        self.project = project
                        self.dispatch(activeProjectUpdated(project))

                        $email.val('')
                        $email.data('userid', '')
                        $name.val('')

                        var $accessUser = self.renderAccessUser(name, email, id)
                        self.$box.find('.project-access-users-box').prepend($accessUser)
                        self.userEmails[email] = name
                        self.toggleUsersBox()
                    }, function (errors) {
                        error = errors[Object.keys(errors)[0]][0]
                        $error.text(error)
                    })
                }
                return false
            })

        this.$box.find('.project-access-add-user-email')
            .data("remote", `${ProjectsUrls.api.addProject}?project=${this.project.id}`)
            .autocomplete({
                appendTo: this.$box.find(".project-access-user-email-autocomplete"),
                params:{type: 'pacc', datatype: 'ac', project:this.project.id},
                serviceUrl: AuthUrls.api.users,
                onSelect: function(suggestion) {
                    self.$box.find('.project-access-add-user-email').val(suggestion.data.email)
                    self.$box.find('.project-access-add-user-email').data('userid', suggestion.data.id)
                    self.$box.find('.project-access-add-user-name').val(suggestion.data.name)
                    self.$box.find('form').validator('validate')
                }
            })

        this.$box.find('.project-access-add-user-name')
            .autocomplete({
                appendTo: this.$box.find(".project-access-user-name-autocomplete"),
                params:{type: 'pacc', datatype: 'ac', project:this.project.id},
                serviceUrl: AuthUrls.api.users,
                onSelect: function(suggestion) {
                    self.$box.find('.project-access-add-user-email').val(suggestion.data.email)
                    self.$box.find('.project-access-add-user-email').data('userid', suggestion.data.id)
                    self.$box.find('.project-access-add-user-name').val(suggestion.data.name)
                    self.$box.find('form').validator('validate')
                }
            })

        this.$box.find('.select-project-access-all-users-btn').change(function(){
            var checked = $(this).is(':checked')
            self.$box.find('input[type=checkbox]').prop('checked', checked)
        })
    }
}

export class ProjectCRUDManager{
    constructor(options) {
        this.dispatch = options.dispatch
        this.user = options.user
        this.project = options.project
        this.$box = $(options.box)
        this.$workers = this.$box.find('.workers')
        this.companyUserLinks = options.companyUserLinks
    }

    run(){
        this.bindButtons()
        this.loadProjectMarkerOnMap()
    }

    eventOnEndTextPrinting(input){
        var self = this
        var x = ''
        input.keyup(function(){
            clearTimeout(x)
            //$('#status').text('typing text')

            var address = self.$box.find('#id_address').val()
            if(address.length){
                x = setTimeout(function(){
                    //sent reqest
                    self.$box.find('.find-project-location-btn').click()
                }, 2000)       // time = 2 sec
            }else{
                var button = self.$box.find('.find-project-location-btn')
                button.find('.fa').addClass('fa-map-marker').removeClass('fa-circle-o-notch').removeClass('fa-spin')
            }
        })
    }

    bindProjectDateFields(){
        var self = this
        var $workdayStart = this.$box.find('#workday_start')
        var $workdayEnd   = this.$box.find('#workday_end')
        if (isMobile('any') && isTimeFieldSupported()) {
            $workdayStart.removeAttr('readonly').prop('type', 'time')
            $workdayEnd.removeAttr('readonly').prop('type', 'time')
        }else{
            $("#dtBox").DateTimePicker({
                addEventHandlers: function() {
                    var dtPickerObj = this;
                    $("#id_workday_end").click(function(e){
                        e.stopPropagation();
                        dtPickerObj.showDateTimePicker($("#id_workday_end input"));
                    });

                    $("#id_workday_start").click(function(e){
                        e.stopPropagation();
                        dtPickerObj.showDateTimePicker($("#id_workday_start input"));
                    });
                }
            })
        }

        var $startDate = self.$box.find('#id_start_date')
        var $endDate   = self.$box.find('#id_end_date')
        if (isMobile('any') && isDateFieldSupported()) {
            var format, formatArray
            format = $startDate.val()

            if (format!=''){
                formatArray = format.split("/")
                format = formatArray[2]+'-'+formatArray[1]+'-'+formatArray[0]
            }

            $startDate.val(format)
            $startDate.prop('type', 'date')
            $startDate.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

            format = $endDate.val()
            if (format!=''){
                formatArray = format.split("/")
                format = formatArray[2]+'-'+formatArray[1]+'-'+formatArray[0]
            }
            $endDate.val(format)
            $endDate.prop('type', 'date')
            $endDate.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")
        }else{
            $startDate.pickadate({
                format: 'dd/mm/yyyy',
                container: '#pickadatecontainer',
                closeOnSelect: true,
                closeOnClear: true,
            })
            $endDate.pickadate({
                format: 'dd/mm/yyyy',
                container: '#pickadatecontainer',
                closeOnSelect: true,
                closeOnClear: true,
            })
        }
    }

    bindButtons(){
        var self = this
        this.$box.find('.search').keyup(function () {
            var rex = new RegExp($(this).val(), 'i')
            $('.searchable tr').hide()
            $('.searchable tr').filter(function () {
                return rex.test($(this).text())
            }).show()
        })
        this.$box.find('.project-manager').autocomplete({
            appendTo: "#project-manager-autocomplete",
            params:{type: 'cmem', datatype: 'ac'},
            serviceUrl: AuthUrls.api.users,
            onSelect: (suggestion) => {
                var $input = self.$box.find('.project-manager')
                $input.val(`${suggestion.data.name}(${suggestion.data.email})`)

                var email = suggestion.data.email;
                var companyUsers = [].concat(self.companyUserLinks)
                var index = 0
                var needDispatch = false
                for(let companyUserLink of companyUsers){
                    if(companyUserLink.project_role == 'manager'){
                        companyUsers[index]['project_role'] = null
                    }
                    if(email && email == companyUserLink.email){
                        companyUsers[index]['project_role'] = 'manager'
                        needDispatch = true
                    }
                    index += 1
                }

                self.$box.find('.project-manager').trigger('change')

                if(needDispatch){
                    self.dispatch(activeProjectCompanyUsersChanged(companyUsers))
                }

                return false

            }
        })

        this.$box.find('.select-all-btn').change(function(){
            var checked = $(this).is(':checked')
            self.$workers.find('input[type=checkbox]').prop('checked', checked)
        })
        this.$box.find('.find-project-location-btn').click(function() {
            var button = $(this)
            button.find('.fa').removeClass('fa-map-marker').addClass('fa-circle-o-notch').addClass('fa-spin')

            var geocoder = new google.maps.Geocoder()
            var address = self.$box.find('#id_address').val()
            if(address.length){
                geocoder.geocode( { 'address': address}, (results, status) => {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var latitude = results[0].geometry.location.lat()
                        var longitude = results[0].geometry.location.lng()
                        self.showProjectMarkerOnMap(latitude, longitude)
                        button.find('.fa').addClass('fa-map-marker').removeClass('fa-circle-o-notch').removeClass('fa-spin')
                    }
                })
            }else{
                Geolocation.getCurrentCoordinates(function(position){
                    if(position){
                        var latitude = position.coords.latitude
                        var longitude = position.coords.longitude
                        self.showProjectMarkerOnMap(latitude, longitude)
                        var geocoder = new google.maps.Geocoder()
                        var latLng = new google.maps.LatLng(latitude, longitude)
                        geocoder.geocode({'latLng': latLng}, (results, status) => {
                            //console.log(results)
                            var address = ''
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    address = results[0].formatted_address
                                }else if (results[1]) {
                                    address = results[1].formatted_address
                                }
                                self.$box.find('#id_address').val(address)
                                button.find('.fa').addClass('fa-map-marker').removeClass('fa-circle-o-notch').removeClass('fa-spin')
                            }
                        })
                        self.setProjectCoordinates(latitude, longitude)
                    }

                }, function() {
                    button.find('.fa').addClass('fa-map-marker').removeClass('fa-circle-o-notch').removeClass('fa-spin')
                    swal(gettext("Cancelled"), gettext("Please enable html5 geolocation in your browser for using application"), "error")
                })
            }

        })
        this.$box.find('form').validator({
            custom:{
                manageremail: function($el){
                    var email = $el.val().replace(/ /g, "").toLowerCase();
                    var isEmpty = !email.length
                    var valid = false
                    email = extractEmail(email)

                    for(let companyUserLink of self.companyUserLinks){
                        if(email == companyUserLink.email){
                            valid = true
                            break;
                        }
                    }

                    return !isEmpty ? valid : true
                }
            },
            errors: {manageremail: true}
        }).on('submit', (e) => {
            if (e.isDefaultPrevented()) {
                return false
            }
            var params = self.$box.find('form').serialize()
            if(!this.project.id){
                POSTRequest(`${ProjectsUrls.api.addProject}?fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`, params, (project) => {
                    project = new Project(project)
                    self.dispatch(activeProjectUpdated(project), true)
                    appHistory.goBack()
                })
            }else{
                PUTRequest(`${ProjectsUrls.api.project(this.project.id)}?fields=${config.PROJECTS_ACTIVE_PROJECT_FIELDS}`, params, (project) => {
                    project = new Project(project)
                    self.dispatch(activeProjectUpdated(project))
                    appHistory.goBack()
                })
            }
            return false
        })
        self.eventOnEndTextPrinting($('#id_address'))
        self.bindProjectDateFields()
    }

    setProjectCoordinates(latitude, longitude){
        this.$box.find('#id_coordinates').val(JSON.stringify({'latitude':latitude, 'longitude':longitude}))
    }

    showProjectMarkerOnMap(lat, lng) {
        var self = this
        this.$box.find('#map-canvas').show()
        this.$box.find('.map-canvas-box').show()
        google.maps.event.addDomListener(window, 'load', function(lat,lng){
            var myLatlng = new google.maps.LatLng(lat,lng)
            var mapOptions = {
              center: myLatlng,
              zoom: 18
            }
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)

            var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              title: gettext('Address'),
              draggable:true
            })

            google.maps.event.addListener(marker, 'dragend', function(){
                var position = marker.getPosition()
                self.setProjectCoordinates(position.lat(), position.lng())
            })
            self.setProjectCoordinates(lat, lng)
        }(lat, lng))
    }

    loadProjectMarkerOnMap() {
        if(this.project && this.project.coordinates.length){
            this.showProjectMarkerOnMap(this.project.coordinates[1], this.project.coordinates[0])
        }
    }
}