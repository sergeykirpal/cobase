import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {isDateFieldSupported, isTimeFieldSupported} from 'utils/date.es6'
import {CompaniesUrls, AuthUrls} from 'constants/Urls.es6'
import {isMobile} from 'utils/environment.es6'
import {bytesToSize} from 'utils/file.es6'
import * as config from 'constants/Config.es6';
import {userUpdated} from 'actions/auth.es6'
var moment = require('moment');
var userFields = config.AUTH_USER_BASE_FIELDS.concat(['company_services'])

export class UserProfileManager{
    constructor(options) {
        this.$profileBox = $(options.profileBox)
        this.$projectsReportsBox = $(options.projectsReportsBox)
        this.$companyBox = $(options.companyBox)
        this.user = options.user
        this.dispatch = options.dispatch
    }

    bindProfileButtons(){
        var self = this
        $('.profile-tab').click(function(){
            var $box = self.$profileBox
            $('.nav-tabs').find('li').removeClass('active')
            $('.nav-tabs').find('.profile-tab').parent().addClass('active')
            $('.tab-pane').hide()
            $box.show()
        })
        $('.projects-reports-tab').click(function(){
            var $box = self.$projectsReportsBox
            $('.nav-tabs').find('li').removeClass('active')
            $('.nav-tabs').find('.projects-reports-tab').parent().addClass('active')
            $('.tab-pane').hide()
            $box.show()
            if($box.hasClass('unloaded')){
                self.loadProjectsReports()
            }
        })
        $('.company-tab').click(function () {
            var $box = self.$companyBox
            $('.nav-tabs').find('li').removeClass('active')
            $('.nav-tabs').find('.company-tab').parent().addClass('active')
            $('.tab-pane').hide()
            $box.show()
        })
        this.$profileBox.find('.show-profile-form-btn').click(function(){
            self.$profileBox.find('.profile-edit-form').show()
            self.$profileBox.find('.profile-information').hide()
        })
        this.$profileBox.find('.cancel-submit-btn').click(function(){
            self.$profileBox.find('.profile-edit-form').hide()
            self.$profileBox.find('.profile-information').show()
        })
    }

    bindProjectsReportsButtons(){
        var self = this

        this.$projectsReportsBox.on('click', '.toggle-projects-reports-week-btn', function(){
            var $btn = $(this)
            var $week = $btn.closest('.projects-reports-week')
            var $box = $week.find('.week-days')
            var date = $btn.data('date')
            if($btn.hasClass('unloaded')){
                GETRequest(AuthUrls.api.userProjectsReport(self.user.id, date), null, (days) => {
                    $btn.removeClass('unloaded')
                    var $days = self.renderProjectsReportDaysHtml(days)
                    $box.append($days)
                })
            }else{
                $box.toggle()
            }
        })

        var start_date_filter = this.$projectsReportsBox.find('.start-date-filter')
        var end_date_filter   = this.$projectsReportsBox.find('.end-date-filter')
        if (isMobile('any') && isDateFieldSupported()) {
            var format1 = start_date_filter.val()
            if (format1!=''){
                var format1Array = format1.split("/")
                format1 = format1Array[2]+'-'+format1Array[1]+'-'+format1Array[0]
            }
            start_date_filter.val(format1)
            start_date_filter.prop('type', 'date')
            start_date_filter.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")


            var format1 = end_date_filter.val()
            if (format1!=''){
                var format1Array = format1.split("/")
                format1 = format1Array[2]+'-'+format1Array[1]+'-'+format1Array[0]
            }
            end_date_filter.val(format1)
            end_date_filter.prop('type', 'date')
            end_date_filter.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")
        }else{
            start_date_filter.pickadate({
                format: 'dd/mm/yyyy',
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            })

            end_date_filter.pickadate({
                format: 'dd/mm/yyyy',
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            })
        }

        this.$projectsReportsBox.find('.apply-filter-btn').click(function(){
            var data = self.$projectsReportsBox.find('.filter-form').serializeArray()
            var params = {}
            if (isMobile('any') && isDateFieldSupported()) {
                data[0].value = moment(params[0].value).format("DD/MM/YYYY")
                data[1].value = moment(params[1].value).format( "DD/MM/YYYY")
            }
            for(let param of data){
                params[param.name] = param.value
            }
            self.loadProjectsReports(params)
        })

        $("#id_start_date, #id_end_date, #id_start_date_stat, #id_end_date_stat").focus(function(){$(this).blur()})
    }

    bindCompanyButtons(){
        var self = this
        this.$companyBox.find('.edit-company-btn').click(function () {
            self.$companyBox.find('.company-view').hide();
            self.$companyBox.find('.company-form').show();
        })
        this.$companyBox.find('.leave-company-btn').click(function () {
            PUTRequest(CompaniesUrls.api.companyWorker(self.user.company.id), {action:'leave'}, (company) => {
                location.reload()
            })
            return false
        })
    }

    loadProjectsReports(params=null){
        var $box = this.$projectsReportsBox
        $box.find('.projects-reports-week').remove()
        $box.find('.projects-reports-week-clear').remove()
        GETRequest(AuthUrls.api.userProjectsReports(this.user.id), params, (reports) => {
            $box.removeClass('unloaded')
            var $weeks = this.renderProjectsReportsHtml(reports.data, reports.keys)
            $box.find('.projects-reports-items').append($weeks)

            if($box.hasClass('jsonscroll')){
                $box.jsonscroll.destroy()
                $box.find('.jsonscroll-loading').remove()
            }

            $box.find('.projects-reports-week:first .toggle-projects-reports-week-btn').trigger('click')
            $box.addClass('jsonscroll').jsonscroll({
                nextSelector: 'a.jscroll-next:last',                
                contentHandler: (response) => {
                    return this.renderProjectsReportsHtml(response.data, response.keys)
                }
            })
        })
    }

    renderProjectsReportsHtml(reports, keys){
        var data = []
        for(let weekNum of Object.keys(reports)){
            let weekDays = reports[weekNum]
            let $week = this.renderProjectsReportWeekHtml(weekNum, weekDays, keys)
            data.unshift($week)
        }

        return data
    }

    renderProjectsReportDaysHtml(days){
        var data = []
        for(let day of days){
            var $day = $($('#projects-report-day').render({
                day:day,
            }))
            $day.data('day', day)
            data.unshift($day)
        }

        return data
    }

    renderProjectsReportWeekHtml(weekNum, weekDays, keys){
        var html = $('#projects-reports-week').render({
            weekNum:weekNum,
            weekDays:weekDays,
            keys: keys
        })
        var $week = $(html)
        return $week
    }

    run() {
        this.bindProfileButtons()
        this.bindProjectsReportsButtons()
        this.bindCompanyButtons()
    }
}

export class UserProfileFormManager {
    constructor(options) {
        this.$box = $(options.box)
        this.$messages = this.$box.find(options.messages)
        this.user = options.user
        this.languageCode = options.languageCode
        this.dispatch = options.dispatch
    }

    run() {
        this.bindFormButtons()
    }

    bindFormButtons() {
        var self = this
        self.$box.on('click', '.form-control', () => {
             this.$messages.empty()
             this.$box.find('.edit-btns').show();
        })
        self.$box.find('.imageupload').fileupload({
            add: (e, data) => {
                var error = null;
                var cfg = config.AUTH_USER_IMAGE_UPLOAD_LIMITATIONS

                data.url = `${AuthUrls.api.profileImage(this.user.id)}?fields=${userFields}`
                data.formData = {jssid:'1234'}

                $.each(data.files, (index, file) => {
                    if (file.type.length && !cfg.accept_file_types.test(file.type)) {
                        error = gettext('Not an accepted file type: ') + file.type;
                    }
                    if (file.name.length && !cfg.accept_file_extensions.test(file.name)) {
                        error = gettext('Not an accepted filename: ') + file.name;
                    }
                    if (file.size && file.size > cfg.max_file_size) {
                        error = gettext('Filesize is too big. Allowed ') + bytesToSize(this.max_file_size);
                    }

                    if (error){
                        var errors = {image: [error]}
                        this.showErrors(errors)
                    }else{
                        $('.progress').show()
                        if (!isMobile('any')) {
                            $('.progress').addClass('progressDesctop')
                        }
                        data.submit()
                    }
                });
            },
            progress: (e, data) => {
                var $progress = $('.progress')
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $progress.find('.persent').text(progress + '%')
                $progress.find('.progress-bar').attr({ style: 'width:' + progress + '%;', 'aria-valuenow': progress})
            },
            done: (e, data) => {
                var user = data.jqXHR.responseJSON
                self.dispatch(userUpdated(user))
                $('.progress').hide()
                $('.progress .progress-bar').attr({ 'style': 'width:0', 'aria-valuenow': '0'})
            },
            fail: function (e, data) {
                if (data.errorThrown != 'abort') {
                    errors = $.parseJSON(data.jqXHR.responseText);
                    this.showErrors(errors)
                }
            },
            dataType: 'json',
            singleFileUploads: true,
            autoUpload: true
        });
        self.$box.on('keyup', '.new-pass', function () {
            var $btn = $(this)
            if ($btn.val()==''){
                self.$box.find('.new-pass-aditional').hide();
                self.$box.find('.current-pass')
                    .removeAttr('data-remote')
                    .removeAttr('required')
                    .removeAttr('data-error');
                self.$box.find('.pass-again')
                    .removeAttr('data-minlength')
                    .removeAttr('required')
                    .removeAttr('data-match')
                    .removeAttr('data-match-error')
                    .removeAttr('data-minlength-error')
                    .removeAttr('data-error');
            }else{
                self.$box.find('.new-pass-aditional').show();
                self.$box.find('.current-pass')
                    .attr('data-remote', AuthUrls.api.addProfile)
                    .attr('required','required')
                    .attr('data-error',gettext('Current password is not correct'));
                self.$box.find('.pass-again')
                    .attr('data-minlength','6')
                    .attr('required','required')
                    .attr('data-match','#new_password')
                    .attr('data-match-error',gettext("Whoops, these don't match with New Password field"))
                    .attr('data-minlength-error',gettext('Not long enough'))
                    .attr('data-error',gettext("The field is required"));
            }
        })
        self.$box.find('#phone').mask('000000000000')
        self.$box.find('#email').data("remote", AuthUrls.api.addProfile);
        self.$box.find('#username').data("remote", AuthUrls.api.addProfile);
        self.$box.on('keyup', '#username', function () {
            var $btn = $(this)
            $btn.val(self.handleUsernameField($btn.val()))
        })
        self.$box.find('form').validator().on('submit', (e) => {
            if (!e.isDefaultPrevented()) {
                var data = this.$box.find('form').serialize()
                var url = `${AuthUrls.api.profile(this.user.id)}?fields=${userFields}`
                this.$messages.empty();

                PUTRequest(url, data, function (user) {
                    if(self.languageCode != user.language){
                        location.reload()
                    }else{
                        self.dispatch(userUpdated(user))
                        self.$box.find('.cancel-submit-btn').click()
                    }
                })
            }
            return false;
        })
    }

    showErrors(errors) {
        this.$messages.empty();
        for (let attr of Object.keys(errors)){
            var values = errors[attr]
            var attrLabel = this.$box.find('#'+attr).attr('placeholder')
            var $error = $('<div class="alert alert-warning" role="alert"></div>')
            attr = attr.charAt(0).toUpperCase() + attr.slice(1)
            var error = attrLabel + ": " + values[0];
            $error.html(error);
            this.$messages.append($error)
        }
    }

    handleUsernameField(value) {
        return $.transliterate(value).replace(/ /g, "-").toLowerCase()
    }
}