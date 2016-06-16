import {CompaniesUrls, AuthUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {isDateFieldSupported, isTimeFieldSupported} from 'utils/date.es6'
import {isMobile} from 'utils/environment.es6'
import {companyUserAdded} from 'actions/auth.es6'
import {userUpdated} from 'actions/auth.es6'


export class CompanyManager{
    constructor(options){
        this.$box = $(options.box)
        this.$membersBox = this.$box.find('#members-box')
        this.$workersReportsBox = this.$box.find('#workers-reports-box')
        this.company = options.company
        this.members = options.members
        this.dispatch = options.dispatch
        this.loadingHtml = '<img src="/static/img/loading.gif" alt="Loading" /> '+gettext('Loading...');
    }

    run() {
        this.bindCompanyMembersButtons()
        this.bindWorkersReportsButtons()
    }

    refreshWorkersReports(params = null) {
        var url = `${CompaniesUrls.api.companyWorkersReports(this.company.id)}?${params}`
        GETRequest(url, null, (response) => {
            this.$workersReportsBox.removeClass('unloaded')
            var $box = this.$workersReportsBox.find('.workers-reports-users')
            $box.empty()
            var $users = this.renderWorkersReportsUsersHtml(response);
            $box.append($users)
        });
    }

    renderWorkersReportsUsersHtml(users, keys=null) {
        var data = []
        var self = this
        for(let user of users){
            var $user = self.renderWorkersReportsUserHtml(user, keys);
            data.push($user);
        }
        return data;
    }

    renderWorkersReportsUserHtml(user, keys) {
        var self = this

        $.each(user.worked_dates, function( i , val) {

            var day  = moment(val.date).format('DD');
            var dayName  = moment(val.date).format('dddd');
            var month  = moment(val.date).format('MMM');

            var dateformat = day+'. '+month+', '+dayName;

            user.worked_dates[i].date_formatted = dateformat;
        })

        var html = $('#workers-reports-user-template').render({
            user: user,
            User: self.user,
            company: this.company,
            keys: keys ? keys : {}
        });

        var $user = $(html);
        $user.data('user', user)
        return $user;
    }

    bindCompanyMembersButtons(){
        var self = this
        this.$membersBox.find('form').each((k, f) => {
            $(f).validator({
                custom:{ uniqueemail: ($el) => {
                    var email = $el.val().replace(/ /g, "").toLowerCase();
                    var $emails = this.$box.find('input[type=email]').not($el)
                    var emails = []
                    $emails.each(function (k, v) {
                        emails.push($(v).val().replace(/ /g, "").toLowerCase())
                    })
                    return emails.indexOf(email) == -1
                    }
                },
                errors: { uniqueemail: true}
            }).on('submit', (e) => {
                if (e.isDefaultPrevented()) {
                    return false
                }

                let data = {}
                var $form = $(e.target)
                $.each($form.serializeArray(), function(i, field) {
                    data[field.name] = field.value;
                });

                POSTRequest(CompaniesUrls.api.companyUserInvites(this.company.id), {data:JSON.stringify([data])}, (response) => {
                    self.dispatch(companyUserAdded(response[0]))
                    this.$box.find('input[name=email]').val('')
                    this.$box.find('input[name=name]').val('')
                })
                return false;
            })
        })
        this.$membersBox.find('input[name=email]')
            .data('remote', CompaniesUrls.api.companyAddUserInvite(this.company.id))
            .autocomplete({
                params:{type: 'cui', datatype: 'ac', field: 'email'},
                serviceUrl: AuthUrls.api.users,
                onSelect: function (suggestion) {
                    var $input = $(this)
                    $input.val(suggestion.data.email);
                    $input.closest('.add-member').find('input[name=name]').val(suggestion.data.name);
                    $input.closest('form').validator('validate')
                }
        });
        this.$membersBox.find('input[name=name]')
            .autocomplete({
                params:{type: 'cui', datatype: 'ac', field: 'name'},
                serviceUrl: AuthUrls.api.users,
                onSelect: function (suggestion) {
                    var $input = $(this)
                    $input.val(suggestion.data.name);
                    $input.closest('.add-member').find('input[name=email]').val(suggestion.data.email);
                    $input.closest('form').validator('validate')
                }
        });
    }

    bindWorkersReportsButtons() {
        var self = this

        self.$box.find('.download-all-btn').change(function () {
            var check = $(this).prop('checked')
            $('.user-check-btn').prop('checked',check)
        })
        self.$box.find('.export-btn').click(function () {
            self.$box.find('.download-user, .download-battons').show()
            self.$box.find('.download-title').hide()
            $(this).hide()
        })
        self.$box.find('.export-cancel-btn').click(function () {
            self.$box.find('.download-user, .download-battons').hide()
            self.$box.find('.download-title').show()
            self.$box.find('.export-btn').show()
        })
        this.$box.find('.workers-reports-tab').click(function () {
            if (self.$workersReportsBox.hasClass('unloaded')) {
                self.refreshWorkersReports()
            }
        })
        this.$workersReportsBox.find('.apply-filter-btn').click(function(){
            var params = self.$workersReportsBox.find('.filter-form').serialize()
            self.refreshWorkersReports(params)
        })
        var start_date_filter = $('#start-date-filter')
        var end_date_filter   = $('#end-date-filter')
        if (isMobile('any') && isDateFieldSupported) {
            start_date_filter.prop('type', 'date')
            start_date_filter.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

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
                format: 'yyyy-mm-dd',
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            })
            end_date_filter.pickadate({
                format: 'yyyy-mm-dd',
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            })
        }

        this.$workersReportsBox.on('click', '.toggle-worker-details-btn, .diary-item .date', function () {
            var $box = $(this).closest('.worker-item').find('.worker-details')
            var $item = $(this).closest('.worker-item')
            $box.toggleClass('hide')
            if ($box.hasClass('hide')){
                $item.find('.toggle-worker-details-btn').find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
            }else{
                $item.find('.toggle-worker-details-btn').find('.fa').addClass('fa-angle-up').removeClass('fa-angle-down');
            }
        })
        this.$workersReportsBox.on('click', '.toggle-workers-reports-day-btn', function(){
            var $btn = $(this)
            var $parent = $btn.closest('.workers-reports-day')
            var $box = $parent.find('.workers-reports-day-data')
            var day = $parent.data('day')
            if($box.hasClass('unloaded')){
                GETRequest(day.urls.data, null, function(response){
                    $box.removeClass('unloaded')
                    var $dayData = self.renderWorkerReportsDayData(response)
                    $box.append($dayData)
                    $box.toggleClass('hide')
                })
            }else{
                $box.toggleClass('hide')
            }
        })
    }
}

export class CompanyFormManager{
    constructor(options) {
        this.$box = $(options.box)
        this.user = options.user
        this.dispatch = options.dispatch
    }

    bindButtons(){
        var self = this
        this.$box.find('.cancel-save-company-btn').click(function () {
            $('.company-view').show();
            self.$box.hide();
        })
        this.$box.find('.company-title').data("remote", `${CompaniesUrls.api.addCompany}?pk=${self.user.company.id}`);
        this.$box.find('form').validator().on('submit', (e) => {
            if (!e.isDefaultPrevented()) {
                var $form = self.$box.find('form')
                var params = $form.serialize()
                PUTRequest(CompaniesUrls.api.company(self.user.company.id), params, (company) => {
                    self.dispatch(userUpdated({company: company, company_services: company.services}))
                    self.$box.find('.cancel-save-company-btn').click()
                })
                return false
            }
            return false;
        })
    }

    run() {
        this.bindButtons()
    }
}