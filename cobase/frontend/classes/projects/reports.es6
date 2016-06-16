import {createClass} from 'utils/class.es6'
import {isMobile} from 'utils/environment.es6'
import {getUrlHash} from 'utils/url.es6'
import {ProjectsUrls, AuthUrls, CustomFormsUrls} from 'constants/Urls.es6'
import {isDateFieldSupported, isTimeFieldSupported} from 'utils/date.es6'
import {guid} from 'utils/string.es6'
import {bytesToSize} from 'utils/file.es6'
var moment = require('moment');


var ProjectReportsForManager = null;
(function() {
    var renderProjectTaskImage = function (self, file) {
        var $file = $($('#project-task-image-update-template').render({file:file}));
        $file.data('file', file);
        $file.find('.file-size').text(bytesToSize(file.size));

        //file from server
        if (file.id) {
            refreshProjectTaskImage(self, $file);
            //bindRemoveProjectTaskImage(self, $file);
        } else {
            //uploading file
            $file.find('.file-name').text(file.name);
        }

        return $file;
    }
    var refreshProjectTaskImage = function(self, $file){
        var file = $file.data('file');
            //console.log(file)
            $file.find('.file-name').text(file.name);

            if (file.type == 'image') {
                $file.find('.file-thumb').attr('src', file.thumbs.x.src);
                var datasize = file.thumbs.big.width+'x'+file.thumbs.big.height;
                $file.find('.file-thumb').parent().attr('href', file.thumbs.big.src).attr('data-size', datasize);
            }
            initPhotoSwipeFromDOM('.my-gallery');
    }
    var bindRemoveProjectTaskImage = function(self, $file){
        var file = $file.data('file');
        if (file.owner_id != self.user.id) {
            $file.find('.remove-file-btn').hide()
        } else {
            $file.find('.remove-file-btn')
                .data('file', file)
                .show()
                .click(function (event) {

                    var $button = $(this);
                    var $file = $button.closest('.project-task-image');
                    var file = $file.data('file');

                    swal({
                        title: gettext("Are you sure?"),
                        text: gettext("You will not be able to recover this imaginary file!"),
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: gettext("Yes, delete it!"),
                        cancelButtonText: gettext("No, cancel!"),
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function(isConfirm){
                        if (isConfirm) {
                            
                            removeProjectTaskFileRequest(self, ProjectsUrls.api.projectTaskImage(self.project.id, file.id), function (response) {
                                $file.remove();
                                
                                swal({
                                    title: gettext('Deleted!'),
                                    text: gettext("Your imaginary file has been deleted."),
                                    type: "success",
                                    timer: 1500,
                                    showConfirmButton: false
                                })
                            });
                        } else {
                            swal(gettext("Cancelled"), gettext("Your imaginary file is safe :)"), "error")
                        }
                    })

                    return false;
                });
        }
    }
    var removeProjectTaskFileRequest = function (self, url, callback) {
        $.ajax({
            url: url+'?'+ $.param({jssid: '1234'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var findProjectTaskImageIds = function(self, $box){
        var images = []
        var $images = $box.find('figure.project-task-image');
        $images.each(function(k, v){
            var $image = $(v);
            var image = $image.data('file');
            if(image.status == 'ready'){
                images.push(image.id)
            }
        });
        return images;
    }
    var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML;
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) {
                continue;
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');
            if(pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};
    var bindTabs = function(self){
        self.$box.find('.tab').click(function () {
            self.$box.find('.tab').parent().removeClass('active');
            self.$box.find('.content').hide();
            var $tab = $(this);
            $tab.parent().addClass('active');
            var id = $tab.data('id');
            var $box = self.$box.find('.'+id);
            $box.show();
            if($box.hasClass('loading')){
                $box.removeClass('loading');
                if(id=='diary-box'){
                    renderDiaryTab(self);
                }else if(id == 'projectlogsreports-box'){
                    renderProjectLogsReportsTab(self);
                }else if(id == 'self-monitor-box'){
                    renderSelfMonitorTab(self);
                }
            }
            location.href='#'+id;
        });
    }
    var renderDiaryTab = function(self) {
        bindDiaryItemButtons(self);
        refreshDiaryList(self);
    }
    var refreshDiaryTask = function(self, $task, task){
        $task.find('.task-edit.task-title').val(task.title == 'New Task' ? '' : task.title);
        $task.find('.task-data.task-title').html(task.title);
        $task.find('.task-edit.task-description').html(task.description);
        $task.find('.task-data.task-description').html(task.description);
        $task.data('task', task);
    }
    var refreshDiaryList = function(self, params) {
        var $diaryitems = self.$diarybox.find('.diaryweeks');

        retrieveDiaryItemsRequest(self, params, function(response){
            var $items = renderDiaryItemsHtml(self, response.data, response.keys);
            if(params){
                self.retrieveDiaryDayParams = params;
            }

            if ($diaryitems.find('.diary-week').length) {
                $diaryitems.jsonscroll.destroy();
                $diaryitems.find('.jsonscroll-loading').remove();
            }
            $diaryitems.find('.diary-week').remove()
            $diaryitems.find('.clear').remove()

            $diaryitems.append($items);
            $diaryitems.find('.selector:first').trigger('click')
            $diaryitems.jsonscroll({
                nextSelector: 'a.jscroll-next:last',
                contentHandler: function(response){
                    return renderDiaryItemsHtml(self, response.data, response.keys);
                }
            });
        });
    }
    var prepareFilterParams = function(self, params){
        var data = []
        $.each(params, function (k, param) {
            if(param.value.length > 0){
                data.push(param)
            }
        });
        return data
    }
    var bindCreateDiaryTaskFormButtons = function(self){
        var $form = $('#add-diary-task-form')

        $form.on('click', '.cancel-add-diary-task-btn', function() {
            $form.modal('hide')
        });
        $form.on('click', '.add-diary-task-btn', function() {

            var userid = $form.find('.task-user').val()

            if (userid==''){
                $form.find('.task-user-name').parent().addClass('has-error');
                return;
            }

            var data = $form.find('form').serializeArray();
            var date = $form.find('.task-date').val()
            var dateId = date.split("-").join("")

            $.each(data, function(k, v){
                if(v['name'] == 'finished'){
                    if(!v['value'].length){
                        v['value'] = '00:00'
                    }
                    v['value'] = date +'T'+ v['value'];
                }
            });
            data.push({name:'images', value:JSON.stringify(findProjectTaskImageIds(self, $form))});
            data.push({name:'created', value: date +'T00:00'})
            data = prepareDiaryTaskFormData(self, data);
            data.push({name: 'deleted', value: date+'T23:59'});

            createDiaryTaskRequest(self, data, function (task) {
                retrieveDiaryDayDataRequest(self, ProjectsUrls.api.projectReportsDiaryday(self.project.id, date), function(data){
                    var $day = renderDiaryItemDayDataHtml(self, date, data);
                    self.$diarybox.find('.diary-day-items-'+dateId).empty().append($day)
                    initPhotoSwipeFromDOM('.my-gallery');
                    $('#add-diary-task-form').modal('hide');
                });
            });
        });

        $form.find('.task-user-name').autocomplete({
            params:{type: 'pu', datatype: 'ac', project: self.project.id},
            serviceUrl: AuthUrls.api.users,
            appendTo: $form.find('.task-user-name').next(),
            onSelect: function (suggestion) {
                var $input = $(this);
                $input.parent().find('.task-user').val(suggestion.data.id);
            }
        });

        if (!isMobile('iOS')){
            $form.find('.fileupload').attr('multiple','')
        }

        $form.find('.fileupload')
            .fileupload({
                dataType: 'json',
                singleFileUploads: true,
                autoUpload: true,
                add: function (e, data) {
                    var uploadUrl = ProjectsUrls.api.projectTaskImages(self.project.id)
                    var jsguid = guid();
                    var error = null;

                    data.url = uploadUrl;
                    data.formData = {'jssid': '123', jsguid:jsguid};
                    $.each(data.files, function (index, file) {
                        if (file.type.length && !self.uploadconf.accept_file_types.test(file.type)) {
                            error = gettext('Not an accepted file type: ') + file.type;
                        }
                        if (file.name.length && !self.uploadconf.accept_file_extensions.test(file.name)) {
                            error = gettext('Not an accepted filename: ') + file.name;
                        }
                        if (file.size && file.size > self.uploadconf.max_file_size) {
                            error = gettext('Filesize is too big. Allowed ') + bytesToSize(self.max_file_size);
                        }

                        file.jsguid = jsguid;
                        var $file = renderProjectTaskImage(self, file);
                        $form.find('.project-task-images').prepend($file);
                        $file.find('.upload-cancel-btn').show().click(function (e) {
                            data.abort();
                        });
                        $form.find('.progress').show();
                        data.context = $file;

                        if (error) {
                            $file.find('.progress-bar').attr({
                                style: 'width:100%;',
                                'aria-valuenow': 100
                            });
                            $file.addClass('progress-bar-danger');
                            $file.find('.upload-cancel-btn').hide();
                            $file.find('.alert').text(error).show();
                        } else {
                            data.submit();
                        }
                    });
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                done: function (e, data) {
                    var file = data.result;
                    var $file = $(data.context);
                    $file.data('file', file);
                    $file.find('.progress').hide();
                    $file.find('.upload-cancel-btn').hide();
                    refreshProjectTaskImage(self, $file);
                    bindRemoveProjectTaskImage(self, $file);
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                progress: function (e, data) {
                    var $progress = $('.progress')
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $progress.find('.persent').text(progress + '%');
                    $progress.find('.progress-bar').attr({
                        style: 'width:' + progress + '%;',
                        'aria-valuenow': progress
                    })
                },
                stop: function (e) {
                    $('.progress').hide()
                    $('.progress .progress-bar').attr({
                        'style': 'width:0',
                        'aria-valuenow': '0'
                    })
                },
            })
            .prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');
    }
    var bindDiaryItemButtons = function(self){
        bindCreateDiaryTaskFormButtons(self)

        var diary_start_date = self.$diarybox.find('#diary-start-date')
        var diary_end_date   = self.$diarybox.find('#diary-end-date')

        if (isMobile('any') && isDateFieldSupported()) {

            diary_start_date.prop('type', 'date')
            diary_start_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")


            diary_end_date.prop('type', 'date')
            diary_end_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

        }else{
            diary_start_date.pickadate({
                format: "yyyy-mm-dd",
                container: '#pickadatecontainer',
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var endd = diary_end_date.val()
                //console.log(endd)
                if (endd==''){
                    diary_end_date.val(diary_start_date.val())
                }
            })

            diary_end_date.pickadate({
                format: "yyyy-mm-dd",
                container: '#pickadatecontainer',
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var endd = diary_start_date.val()
                //console.log(endd)
                if (endd==''){
                    diary_start_date.val(diary_end_date.val())
                }
            })
        }

        self.$diarybox.on('click', '.apply-filter-btn', function() {
            var $btn = $(this)
            var params = self.$diarybox.find('.diary-filter-item').serializeArray();
            params = prepareFilterParams(self, params);
            refreshDiaryList(self, params);
        });

        self.$diarybox.on('click', '.diary-export-btn', function() {
            var $btn = $(this)
            self.$diarybox.find('.apply-filter-btn').click()
            var url = ProjectsUrls.api.projectReportsDiaryexport(self.project.id)
            var params = self.$diarybox.find('.diary-filter-item').serialize();
            url += '?'+params
            $btn.attr('href', url)
            return true;
        });

        self.$diarybox.on('click', '.diary-task-form-btn', function() {
            var $btn = $(this)
            var day = $btn.closest('.diary-day').data('day')
            var $form = $('#add-diary-task-form')

            $form.find('.task-date').val(day.date)
            $form.find("input[type=text], textarea").val("");
            $form.find("input[type=checkbox]").prop("checked", false);
            $form.find(".project-task-images").empty()
            $form.find('input.task-user').val('');
            $form.find('input.task-user-name').closest('.form-group').show();
            $form.find("#id-duration input").val("01:00");


            if (isMobile('any')) {
                let pbottom = self.windowCoBaseHeight / 2
                $form.find('.block-content').css('max-height',self.modalContentHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            }else{
                $form.css('overflow','auto')
            }

            $form.modal('show')
        });
        self.$diarybox.on('click', '.diary-user-task-form-btn', function() {
            var $btn = $(this)
            var day = $btn.closest('.diary-day').data('day')
            var user = $btn.closest('.diary-user-tasks').data('user')
            var $form = $('#add-diary-task-form')

            $form.find('.task-date').val(day.date)


            $form.find("input[type=text], textarea").val("");
            $form.find("input[type=checkbox]").prop("checked", false);
            $form.find(".project-task-images").empty()
            $form.find('input.task-user').val(user.user.id);
            $form.find('input.task-user-name').closest('.form-group').hide();
            $form.find("#id-duration input").val("01:00");

            if (isMobile('any')) {
                let pbottom = self.windowCoBaseHeight / 2
                $form.find('.block-content').css('max-height',self.modalContentHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            }else{
                $form.css('overflow','auto')
            }
            $form.modal('show')
        });
        self.$diarybox.on('click', '.remove-diary-task-btn', function() {
            var $task = $(this).closest('.diary-task-item');
            var task = $task.data('task');

            swal({
                title: gettext("Are you sure?"),
                text: gettext("You will not be able to recover this task!"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Yes, delete it!"),
                cancelButtonText: gettext("No, cancel!"),
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm){
                if (isConfirm) {
                    removeDiaryTaskRequest(self, ProjectsUrls.api.projectTask(self.project.id, task.task.id), function (task) {
                        $task.remove();
                        swal({
                            title: gettext('Deleted!'),
                            text: gettext("Your task has been deleted."),
                            type: "success",
                            timer: 1500,
                            showConfirmButton: false
                        })
                    });
                } else {
                    swal(gettext("Cancelled"), gettext("Your task is safe :)"), "error")
                }
            })
        });
        self.$diarybox.on('click', '.edit-user-task-btn', function() {
            var task = $(this).closest('.diary-user-tasks')
            task.find('.edit-user-tasks').toggle()
        });
        self.$diarybox.on('click', '.update-diary-task-btn', function() {
            var task = $(this).closest('.diary-task-item')
            var taskData = task.data('task')
            task.find('.diary-edit-field').show()
            task.find('.diary-show-field').hide()
            $(this).hide()
            task.find('.save-diary-task-btn').show()
            task.find('.project-task-image').each(function( index ) {
                bindRemoveProjectTaskImage(self, $(this));
            });
        });
        self.$diarybox.on('click', '.save-diary-task-btn', function() {
            var $btn = $(this)
            var $task = $btn.closest('.diary-task-item')
            var task = $task.data('task')
            var date = $task.closest('.diary-day').data('day')
            var dateId = date.date.split("-").join("")
            $task.find('.diary-edit-field').hide()
            $task.find('.diary-show-field').show()

            var data = $task.find('.diary-edit-field').serializeArray()
            $.each(data, function(k, v){
                if(v['name'] == 'finished'){
                    if(!v['value'].length){
                        v['value'] = '00:00'
                    }
                    v['value'] = date.date +'T'+ v['value'];
                }
            });
            updateDiaryTaskRequest(self, ProjectsUrls.api.projectReportsTask(self.project.id, task.task.id), data, function(updatedTask){
                $btn.hide()
                $task.find('.update-diary-task-btn').show()
                //var $updatedTask = renderDiaryTaskHtml(self, {day_worked_time:taskTime, task:updatedTask})
                //$task.replaceWith($updatedTask)
                retrieveDiaryDayDataRequest(self, ProjectsUrls.api.projectReportsDiaryday(self.project.id, date.date), function(data){
                    var $day = renderDiaryItemDayDataHtml(self, date, data);
                    self.$diarybox.find('.diary-day-items-'+dateId).empty().append($day)
                    initPhotoSwipeFromDOM('.my-gallery');
                });
            })
        });
        self.$diarybox.on('click', '.diary-task-close-box-btn', function() {
            var selector = self.$diarybox.find('.selector');
            selector.parent().find('.info').addClass('hide');
            selector.parent().find('.diary-day-data-box').addClass('hide');
            selector.find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
            selector.data('state', 1);
        });



        self.$diarybox.on('click', '.selector', function() {
            var state = $(this).data('state');
            var $button = $(this);
            var $day = $(this).parent();
            var day = $day.data('day');
            switch(state){
                case 1 :
                case undefined :

                    $day.find('.info').removeClass('hide');
                    $day.find('.diary-day-data-box').removeClass('hide');
                    $button.find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $button.data('state', 2);

                    if($day.hasClass('loading')){
                        var $dataBox = $day.find('.diary-day-data-box');
                        $dataBox.append('<center><img src="/static/img/loading.gif" /></center>');
                        retrieveDiaryDayDataRequest(self, day.urls.data, function(data){
                            var $data = renderDiaryItemDayDataHtml(self, day, data);
                            $dataBox.empty().append($data);
                            $day.removeClass('loading');
                            initPhotoSwipeFromDOM('.my-gallery');
                        })
                    }

                    break;
                case 2 :

                    $(this).parent().find('.info').addClass('hide');
                    $(this).parent().find('.diary-day-data-box').addClass('hide');
                    $button.find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(this).data('state', 1);
                    break;
            }
        });

        self.$diarybox.on('click', '.diary-item .date', function() {
            var state = $(this).parent().find('.selector').data('state');
            if (state!=2)
                $(this).parent().find('.selector').click();
        });

        self.$diarybox.on('change', '.extra-filter-btn', function() {
            var params = self.$diarybox.find('.diary-filter').serializeArray();
            params = prepareFilterParams(self, params);
            refreshDiaryList(self, params);
        });
        self.$diarybox.on('click', '.diary-task-time-edit-field', function() {
            $(this).attr('name', 'finished')
        });
    }
    var renderDiaryItemsHtml = function (self, items, keys){
        var data = [];
        $.each(items, function (week_number, week_data) {
            if(week_data[0]){
                week_number = week_data[0].week
                var $item = renderDiaryItemHtml(self, week_number, week_data, keys);
                data.unshift($item);
            }
        });
        return data;
    }
    var renderDiaryItemHtml = function(self, week_number, week_days, keys){
        var html = $('#diary-item-template').render({
            week: week_number,
            User: self.user,
            project: self.project,
            keys:keys ? keys : {}
        });
        var $diaryitem = $(html);

        $.each(week_days, function(k, day){
            var $day = renderDiaryItemDayHtml(self, day);
            $diaryitem.find('.diary-week-days').append($day);
        });

        return $diaryitem;
    }
    var renderDiaryItemDayHtml = function(self, day){
        var html = $('#diary-item-day-template').render({
            day: day,
            User:self.user,
            project: self.project
        });
        var $day = $(html);
        $day.data('day', day);
        return $day;
    }
    var renderDiaryItemDayDataHtml = function(self, day, data){
        var html = $('#diary-item-day-data-template').render({
            data: data,
            User:self.user,
            project: self.project
        });

        var $dayData = $(html);

        if (self.isProjectArchived)
            $dayData.find('.diary-task-form-btn').hide()

        var $projectLogsBox = $dayData.find('.diary-day-projectlogs');
        var $userTasksBox = $dayData.find('.diary-day-tasks');
        var $extraTasksBox = $dayData.find('.diary-day-extra-tasks');

        var $projectLogs = renderProjectLogsDayHtml(self, data)
        $projectLogsBox.append($projectLogs)

        //user`s tasks
        $.each(data.users, function(user_id, user){
            if ($.isNumeric(user_id) && user.tasks.length){
                var $userTasks = renderDiaryUserTasksBoxHtml(self, user);
                var $tasks = $userTasks.find('.diary-tasks');
                $.each(user.tasks, function(t, data){
                    var $task = renderDiaryTaskHtml(self, data, user.user);
                    $tasks.append($task);

                    var $images = $task.find('.project-task-images');

                    if(data.task.files && data.task.files['images']){
                        $.each(data.task.files.images, function (k, image) {
                            var $image = renderProjectTaskImage(self, image);
                            $images.append($image);
                        });
                    }
                });
                if($userTasksBox.length){
                    $userTasksBox.append($userTasks);
                }
            }
        });
        //extra tasks
        if(typeof data.users.extra != 'undefined'){
            var $tasks = $extraTasksBox.find('.extra-tasks');
            $.each(data.users.extra.tasks, function(t, data){
                var $task = renderDiaryTaskHtml(self, data, {});
                $tasks.append($task);

                var $images = $task.find('.project-task-images');

                if(data.task.files && data.task.files['images']){
                    $.each(data.task.files.images, function (k, image) {
                        var $image = renderProjectTaskImage(self, image);
                        $images.append($image);
                    });
                }
            });
            $extraTasksBox.show();
            $extraTasksBox.find('.time-value').text(data.users.extra.total_day_worked_time);
        }

        return $dayData;
    }
    var renderDiaryTaskHtml = function(self, data, user){
        if (data.day_worked_time.length < 5)
            data.day_worked_time = '0'+data.day_worked_time

        var task = data.task;
        var html = $('#diary-task-template').render({
            type: task.type == 'alert' ? 'alert' : 'task',
            task: task,
            data: data,
            user: user,
            project: self.project
        });
        var $task = $(html);

        if (isMobile('any') && isTimeFieldSupported()) {

            var diarytasktimeeditfield = $task.find('.diary-task-time-edit-field')
            diarytasktimeeditfield.removeAttr('readonly').prop('type', 'time')
        }

        $task.data('task', data);
        var $form = $task;

        if (!isMobile('iOS')){
            $form.find('.fileupload').attr('multiple','')
        }

        $form.find('.fileupload')
            .fileupload({
                dataType: 'json',
                singleFileUploads: true,
                autoUpload: true,
                add: function (e, data) {
                    var uploadUrl = ProjectsUrls.api.projectTaskImages(self.project.id)
                    var jsguid = guid();
                    var error = null;

                    data.url = uploadUrl;
                    data.formData = {'jssid': '1234', jsguid:jsguid};

                    if(task){
                       data.formData['task'] = task.id
                    }

                    $.each(data.files, function (index, file) {
                        if (file.type.length && !self.uploadconf.accept_file_types.test(file.type)) {
                            error = gettext('Not an accepted file type: ') + file.type;
                        }
                        if (file.name.length && !self.uploadconf.accept_file_extensions.test(file.name)) {
                            error = gettext('Not an accepted filename: ') + file.name;
                        }
                        if (file.size && file.size > self.uploadconf.max_file_size) {
                            error = gettext('Filesize is too big. Allowed ') + bytesToSize(self.max_file_size);
                        }

                        file.jsguid = jsguid;
                        var $file = renderProjectTaskImage(self, file);
                        $form.find('.project-task-images').prepend($file);
                        $file.find('.upload-cancel-btn').show().click(function (e) {
                            data.abort();
                        });
                        $('.progress').show();
                        data.context = $file;

                        if (error) {
                            $file.find('.progress-bar').attr({
                                style: 'width:100%;',
                                'aria-valuenow': 100
                            });
                            $file.addClass('progress-bar-danger');
                            $file.find('.upload-cancel-btn').hide();
                            $file.find('.alert').text(error).show();
                        } else {
                            data.submit();
                        }
                    });
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                done: function (e, data) {
                    var file = data.result;
                    var $file = $(data.context);
                    $file.data('file', file);
                    $file.find('.progress').hide();
                    $file.find('.upload-cancel-btn').hide();
                    refreshProjectTaskImage(self, $file);
                    bindRemoveProjectTaskImage(self, $file);
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                progress: function (e, data) {
                    var $progress = $('.progress')
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $progress.find('.persent').text(progress + '%');
                    $progress.find('.progress-bar').attr({
                        style: 'width:' + progress + '%;',
                        'aria-valuenow': progress
                    })
                },
                stop: function (e) {
                    $('.progress').hide()
                    $('.progress .progress-bar').attr({
                        'style': 'width:0',
                        'aria-valuenow': '0'
                    })
                },
            })
            .prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');

        return $task;
    }
    var renderDiaryUserTasksBoxHtml = function(self, user){
        var html = $('#diary-user-tasks-template-manager').render({
            user: user
        });
        var $tasks = $(html);

        if (self.isProjectArchived){
            $tasks.find('.diary-user-task-form-btn').hide()
            $tasks.find('.edit-user-task-btn').hide()
        }
        $tasks.data('user', user)
        return $tasks
    }
    var prepareDiaryTaskFormData = function(self, data){
        $.each(data, function(k, item){
            if(item['name'] == 'title' && !item['value'].length){
                item['value'] = 'New Task';
            }
        });
        return data;
    }
    var retrieveDiaryItemsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsDiary(self.project.id),
            data:data,
            type: 'get',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveDiaryDayDataRequest = function(self, url, callback){
        $.ajax({
            url: url,
            type: 'get',
            data: self.retrieveDiaryDayParams,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var updateDiaryTaskRequest = function(self, url, data, callback){
        $.ajax({
            url: url,
            data:data,
            type: 'put',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var createDiaryTaskRequest = function (self, data, callback) {
        $.ajax({
            url: ProjectsUrls.api.projectReportsAddTask(self.project.id),
            type: 'post',
            data: data,
            dataType: 'json',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var removeDiaryTaskRequest = function (self, url, callback) {
        $.ajax({
            url: url+'?'+ $.param({'jssid': '12345'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var renderProjectLogsDayHtml = function(self, dayData){
        var users = []
        $.each(dayData.users, function(userId, user){
            if(user.projectlogs && user.projectlogs['logs']){
                $.each(user.projectlogs.logs, function (k, log) {
                    var offset = moment.parseZone(log.start_datetime).utcOffset();
                    user.projectlogs.logs[k].start_datetime = moment(log.start_datetime).utcOffset(offset).format('HH:mm')
                    user.projectlogs.logs[k].end_datetime = moment(log.end_datetime).utcOffset(offset).format('HH:mm')
                })
                users.push(user)
            }
        })
        var html = $('#project-logs-day-template-manager').render({
            users: users,
            User: self.user,
            project: self.project,
            moment: moment
        });
        var $logs = $(html);

        $logs.find('.edit-logs-times-btn').click(function() {
            $logs.find('.update-logs-times-btn').toggle()
        })

        $logs.find('.update-logs-times-btn').click(function() {
            var $log = $(this).closest('.log-item');
            $log.find('.update-time').show()
            $log.find('.time-data').hide()
            $log.find('.save-logs-times-btn').show()
            $(this).hide()
        })

        $logs.find('.save-logs-times-btn').click(function() {
            var $log = $(this).closest('.log-item');
            $log.find('.update-time').hide()
            $log.find('.time-data').show()
            $log.find('.update-logs-times-btn').show()
            $(this).hide()
        })

        return $logs;
    }
    var renderProjectLogsReportsTab = function(self) {
        bindProjectLogsReportsButtons(self);
        refreshProjectLogsReports(self);
    }
    var refreshProjectLogsReports = function(self) {
        var $projectlogsreports = self.$projectlogsreportsbox.find('.projectlogsreports');

        retrieveProjectLogsReportsRequest(self, {}, function(response){
            var $items = renderProjectLogsReportsHtml(self, response);
            $projectlogsreports.empty().append($items);
        });
    }
    var refreshProjectUserLogsReports = function(self, $box, user) {
        var params = getProjectLogsReportsParams(self)
        params.push({name:'user_id', value:user.id});
        retrieveProjectUserLogsReportsRequest(self, params, function(response){
            var $dates = renderProjectUserLogsReportHtml(self, response)
            $box.empty().append($dates)
            $box.removeClass('unloaded')
        });
    }
    var renderProjectLogsReportsHtml = function (self, items) {
        var data = [];
        $.each(items, function (k, item) {
            var $item = renderProjectLogsReportHtml(self, item);
            data.push($item);
        });

        return data;
    }
    var renderProjectLogsReportHtml = function(self, item){
        var html = $('#projectlogsreport-template').render({
            user: item,
            project: self.project
        });
        var $report = $(html);
        $report.data('workerreport', item);
        return $report;
    }
    var renderProjectUserLogsReportHtml = function(self, report){

        $.each(report.dates, function(i , val) {
            var day  = moment(val.date).format('DD');
            var dayName  = moment(val.date).format('dddd');
            var month  = moment(val.date).format('MMM');
            var dateformat = day+'. '+month+', '+dayName;
            report.dates[i].date_formatted = dateformat;
            var worked_time = report.dates[i].worked_time
            if (worked_time.length < 5)
                report.dates[i].worked_time = '0'+worked_time
        })

        if (report.total_worked_time.length < 5)
            report.total_worked_time = '0'+report.total_worked_time

        var html = $('#projectuserlogsreport-template').render({
            report: report,
            user: self.user,
            project: self.project
        });

        var $dates = $(html);

        if (self.isProjectArchived)
            $dates.find('.edit-worker-time-btn').hide()

        if (isMobile('any') && isTimeFieldSupported()) {
            var worker_time_input = $dates.find('.worker-time-input')
            worker_time_input.removeAttr('readonly').prop('type', 'time')
        }

        $dates.find('.edit-houre-btn').click(function(){
            var item = $(this).closest('tr');
            $(this).hide();
            item.find('.save-houre-btn').show();
            item.find('.time-data-edit').show();
            item.find('.time-data').hide();
        })
        $dates.find('.save-houre-btn').click(function(){
            var item = $(this).closest('tr');
            $(this).hide();
            item.find('.edit-houre-btn').show();
            item.find('.time-data-edit').hide();
            item.find('.time-data').show();
        })
        $dates.find('.remove-houre-btn').click(function(){
            if (confirm("Are you sure to delete?")) {
                var item = $(this).closest('tr');
                item.remove();
            }
        })

        return $dates;
    }
    var retrieveProjectLogsReportsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsProjectLogs(self.project.id),
            data:data,
            type: 'get',
            async:false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
               // console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveProjectUserLogsReportsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsProjectUserLogs(self.project.id),
            data:data,
            type: 'get',
            async:false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
               // console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var getProjectLogsReportsParams = function(self){
        var $filter = self.$projectlogsreportsbox.find('.date-filter')
        var params = $filter.find('input').serializeArray();
        $.each(params, function(k, param){
            if(!param['value'].length){
                delete params[k]
            }
        })
        return params
    }
    var bindProjectLogsReportsButtons = function(self){

        var workhours_start_date = self.$projectlogsreportsbox.find('#workhours-start-date')
        var workhours_end_date   = self.$projectlogsreportsbox.find('#workhours-end-date')

        if (isMobile('any') && isDateFieldSupported()) {

            workhours_start_date.prop('type', 'date')
            workhours_start_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

            workhours_end_date.prop('type', 'date')
            workhours_end_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

        }else{
            workhours_start_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var endd = workhours_end_date.val()
                if (endd==''){
                    workhours_end_date.val(workhours_start_date.val())
                }
            })

            workhours_end_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var endd = workhours_start_date.val()
                if (endd==''){
                    workhours_start_date.val(workhours_end_date.val())
                }
            })
        }
        self.$projectlogsreportsbox.find('.apply-filter-btn').click(function(){
            refreshProjectLogsReports(self);
        });
        self.$projectlogsreportsbox.find('.projectlogs-export-btn').click(function() {
            var $btn = $(this)
            self.$projectlogsreportsbox.find('.apply-filter-btn').click()
            var url = ProjectsUrls.api.projectReportsProjectLogsExport(self.project.id)
            var params = self.$projectlogsreportsbox.find('.projectlogs-filter-item').serialize();
            url += '?'+params
            $btn.attr('href', url)
            return true;
        });

        self.$projectlogsreportsbox.on('click', '.selector', function() {
            var state = $(this).data('state');
            var $box = $(this).parent().find('.worker-item-details')

            if($box.hasClass('unloaded')){
                var user = $(this).closest('.worker-item').data('workerreport')
                refreshProjectUserLogsReports(self, $box, user)
            }

            switch(state){
                case 1 :
                case undefined :
                    $box.removeClass('hide');
                    $(this).find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $(this).data('state', 2);
                    break;
                case 2 :
                    $box.addClass('hide');
                    $(this).find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(this).data('state', 1);
                    break;
            }
        });
        self.$projectlogsreportsbox.on('click', '.diary-item .date', function() {
            var state = $(this).parent().find('.selector').data('state');
            if (state!=2)
                $(this).parent().find('.selector').click();
        });
        self.$projectlogsreportsbox.on('click', '.edit-worker-time-btn', function() {
            var dateId = $(this).parent().data('dateid')
            var $day = $(this).closest('.worker-days').find('.worker-day-'+dateId)
            $day.find('.worker-time').addClass('hide')
            $day.find('.worker-time-input').removeClass('hide')
            $day.find('.save-worker-time-btn').removeClass('hide')
            $(this).addClass('hide')
        });
        self.$projectlogsreportsbox.on('click', '.save-worker-time-btn', function() {
            var $btn = $(this);
            var date = $btn.parent().data('dateid');
            var $report = $btn.closest('.worker-report');
            var $box = $report.find('.worker-item-details')
            var user = $report.data('workerreport')
            var $day = $btn.closest('.worker-days').find('.worker-day-'+date)
            var time = $day.find('.worker-time-input').val()

            $.ajax({
                url: ProjectsUrls.api.projectReportsProjectLog(self.project.id),
                data:{date:date, user_id: user.id, time:time},
                method:'PUT',
                dataType:'json',
                success: function (data) {
                    refreshProjectUserLogsReports(self, $box, user)
                    $box.removeClass('hide');
                    $report.find('.selector').find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $report.find('.selector').data('state', 2);
                }
            })
        });
    }
    //self-monitoring
    var renderSelfMonitorTab = function(self) {
        bindSelfMonitorButtons(self);
        refreshSelfMonitorList(self, {page: 1});

        if (self.isProjectArchived){
            self.$selfmonitorbox.find('.create-sm-template').hide()
            self.$selfmonitorbox.find('.show-sm-templates').hide()
        }
    }
    var createSelfMonitorTemplateFromData = function(self, data){


        var template = '';
        var temp_template ='';
        var items = [];
        var $item = {};
        if(typeof data.field_type === 'string'){
            data.field_type = [data.field_type];
        }
        $.each(data.field_type, function (index, field_type) {
            var renderData = {};
            renderData.branch = $.isArray(data.branch) ? data.branch[index] : data.branch
            renderData.parent_branch = $.isArray(data.parent_branch) ? data.parent_branch[index] : data.parent_branch
            renderData.index = index;
            renderData.parent_index = index - 1;
            renderData.field_type = field_type;
            renderData.checkbox_text_temp = $.isArray(data.checkbox_text_temp) ? data.checkbox_text_temp[index] : data.checkbox_text_temp
            renderData.checkbox1_name_temp = $.isArray(data.checkbox1_name_temp) ? data.checkbox1_name_temp[index] : data.checkbox1_name_temp
            renderData.checkbox1_temp = $.isArray(data.checkbox1_temp) ? data.checkbox1_temp[index] : data.checkbox1_temp
            renderData.checkbox2_name_temp = $.isArray(data.checkbox2_name_temp) ? data.checkbox2_name_temp[index] : data.checkbox2_name_temp
            renderData.checkbox2_temp = $.isArray(data.checkbox2_temp) ? data.checkbox2_temp[index] : data.checkbox2_temp
            renderData.textfield_temp = $.isArray(data.textfield_temp) ? data.textfield_temp[index] : data.textfield_temp
            renderData.text_temp = $.isArray(data.text_temp) ? data.text_temp[index] : data.text_temp
            renderData.active_checkbox = $.isArray(data.active_checkbox) ? data.active_checkbox[index] : data.active_checkbox
            renderData.show_item_by_checkbox = $.isArray(data.show_item_by_checkbox) ? data.show_item_by_checkbox[index] : data.show_item_by_checkbox
            renderData.subfield_name = $.isArray(data.subfield_name) ? data.subfield_name[index] : data.subfield_name

            //console.log(renderData)

            var html = $('#field-template').render({data: renderData});
            var filedhtml = '';

            if (field_type=='text') {
                filedhtml = $('#text-template').render({data: renderData});
            }

            if (field_type=='textfield') {
                filedhtml = $('#textfield-template').render({data: renderData});
            }

            if (field_type=='checkbox') {
                filedhtml = $('#checkbox-template').render({data: renderData});
            }
            //console.log(filedhtml);
            var $field = $(html);
            $field.find('.fielddata').html(filedhtml);
            $field.attr('lavel',renderData.branch);
            $field.find('.subfields').addClass('subfields-'+renderData.branch);
            $field.find('.subfields').removeClass('subfields-'+renderData.parent_branch);

            $field.find('.parent_branch').attr('value',renderData.parent_branch);
            $field.find('.branch').attr('value',renderData.branch);

            html = $field[0].outerHTML;

            //console.log(html);

            if (renderData.parent_branch == 0){

                $item = $(html);

                if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] == 0 ){
                      template = template + $item[0].outerHTML;
                }
            }else {
                var subbox = '.pid'+renderData.parent_branch;
                var countItems = $item.find(subbox).length;

                if (countItems>1){
                    var element = countItems - 1;
                    $item.find(subbox+':eq('+element+')').append(html);
                }else{
                    $item.find(subbox).append(html);
                }


                if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] == 0 ){
                    template = template + $item[0].outerHTML;
                }


            }

            //console.log(template);
        });


        //console.log(template);
        return template;
    }
    var selfMonitorTemplateForm = function(self, data){
        var edit = typeof data.data != 'undefined'

        var formHtml = ''
        if (edit){
            formHtml = createSelfMonitorTemplateFromData(self, data.data);
        }
        var html = $('#self-monitor-edit-template').render({
            data: data,
            formHtml: formHtml
        });

        $('#self-monitor-edit-modal').html(html)

        var height = parseInt(self.windowCoBaseHeight / 1.5,10)
        if (isMobile('any')) {
            let pbottom = self.windowCoBaseHeight / 2
            let newHeight = self.modalContentHeight - 70
            $('#self-monitor-edit-modal').find('.block-content').css('height',newHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            $('#self-monitor-edit-modal').find('.block-header').css('padding-top',self.blockHeadeIOSApp+'px')
        }else{
            $('#self-monitor-edit-modal').css('overflow','hidden')
            let newHeight = self.modalContentHeight - 130
            $('#self-monitor-edit-modal').find('.block-content').css('height',newHeight+'px').css('overflow-y','scroll').css('padding-bottom','50px')
        }
        $('#self-monitor-edit-modal').modal('show');

        var $box = $('#self-monitor-edit-template-form');
        if (edit){
            $box.data('template', data);
            $box.find('.save-sm-template').removeClass('hide');
            $box.find('.save-sm-template-cancel').removeClass('hide');
            $box.find('.fields').show();
            $box.find('.self-monitor-edit-action').val('edit');
        }
    }
    var editSelfMonitorItemForm = function(obj, self){
        var $button = obj;
        var $box = obj.closest('.self-monitor-item');
        $button.hide();
        $box.find('.save-sm-item-form').show();

        $box.find(".imgcheck-checkbox").each(function() {
            $(this).removeClass("hide");
            $(this).find('.imgcheck-checkbox-live').removeAttr('checked');
        });
        $box.find(".readonly, .p_edit").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".text-value, .p_value, .imgcheck-border").each(function() {
            $(this).addClass("hide");
        });
        $box.find(".imgcheck").each(function() {
            $(this).addClass( "hide" );
        });
        $box.find(".self-monitor-form-fields").each(function() {
            if ($(this).hasClass('border-top')){

            }else{
                $(this).hide();
            }
        });
    }
    var editSelfMonitorItemFormWithData = function(obj, self){
        var $button = obj;
        var $box = obj.closest('.self-monitor-item');
        $button.hide();
        $box.find('.save-sm-item-form').show();


        $box.find(".date").hide();

        $box.find(".imgcheck-checkbox").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".readonly, .p_edit").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".text-value, .p_value, .imgcheck-border").each(function() {
            $(this).addClass("hide");
        });
        $box.find(".imgcheck").each(function() {
            $(this).addClass( "hide" );
        });
        $box.find(".self-monitor-form-fields").each(function() {
            if ($(this).hasClass('border-top')){

            }else{
                //$(this).hide();
            }
        });
    }
    var bindSelfMonitorButtons = function(self){
        if(self.last_smtemplate){
            self.$selfmonitorbox.find('.create-sm-item-last-template').show()
        }
        self.$selfmonitorbox.on('click', '.create-sm-template', function() {
            selfMonitorTemplateForm(self, {project_name: self.project.title});
        });

        var self_motitor_start_date = self.$selfmonitorbox.find('#self-motitor-start-date')
        var self_motitor_end_date   = self.$selfmonitorbox.find('#self-motitor-end-date')

        if (isMobile('any') && isDateFieldSupported()) {

            self_motitor_start_date.prop('type', 'date')
            self_motitor_start_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

            self_motitor_end_date.prop('type', 'date')
            self_motitor_end_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")


        }else{

            self_motitor_start_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var $box = $(this).closest('.date-filter');

                var endd = $box.find('#self-motitor-end-date').val()
                if (endd==''){
                    $box.find('#self-motitor-end-date').val(self.$selfmonitorbox.find('#self-motitor-start-date').val())
                }
            });

            self_motitor_end_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var $box = $(this).closest('.date-filter');

                var endd = $box.find('#self-motitor-start-date').val()
                if (endd==''){
                    $box.find('#self-motitor-start-date').val(self.$selfmonitorbox.find('#self-motitor-end-date').val())
                }
            });

        }
        self.$selfmonitorbox.on('click', '.apply-filter-btn', function() {
            var $btn = $(this)
            var params = self.$selfmonitorbox.find('.date-filter').find('input').serializeArray();
            params.push({name:'page', value:1});
            refreshSelfMonitorList(self, params);
        });


         $(document).on('click', '.save-sm-template', function() {
            var $box = $('#self-monitor-edit-template-form');
            var $form = $('#self-monitor-edit-template-form');
            var $button = $(this);
            $form.validator().on('submit', function (e) {
                if (e.isDefaultPrevented()) {
                // handle the invalid form...
                } else {
                    $form.find('input[type="text"]').each( function () {
                        if ($(this).val()=='') $(this).val(' ');
                    });

                    var formData = $form.formParams();
                    if (formData.action == 'add'){
                        createSelfMonitorTemplateRequest(self, {data:JSON.stringify([formData])}, function(templates){
                            var template = templates[0];
                            self.smtemplates.push(template);
                            var itemData = formData;
                            itemData.template = template.id;
                            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                                var item = items[0];
                                self.last_smtemplate = item.template;
                                var $item = renderSelfMonitorItemHtml(self, item);
                                prependSelfMonitorItemToList(self, $item);
                                $('#self-monitor-edit-modal').modal('hide');


                                var selector = $item.find('.selector');
                                var attrState = selector.attr('state');
                                var $box = selector.closest('.self-monitor-item').find('.self-monitor-box')
                                var itemNew = selector.closest('.self-monitor-item').data('item')

                                if($box.hasClass('unloaded')){
                                    retrieveSelfMonitorItemRequest(self, itemNew, {}, function (response) {
                                        renderSelfMonitorItemDetails(self, $box, response)
                                        var editformbutton = $item.find('.edit-sm-item-form');
                                        editSelfMonitorItemForm(editformbutton, self);

                                        selector.find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                                        selector.data('state', 2);
                                    })
                                }
                            });
                        });
                    }
                    if (formData.action == 'edit'){
                        var template = $box.data('template');
                        formData.data = JSON.stringify(formData.data);
                        updateSelfMonitorTemplateRequest(self, template.urls.update, formData, function(updated_template){
                            removeTemplateFromArray(self, template);
                            self.smtemplates.push(updated_template);
                            $('#self-monitor-edit-modal').modal('hide');
                        });
                    }
                    self.$selfmonitorbox.find('.create-sm-item-last-template').show();
              }
              return false;
            });
        });


        $(document).on('click', '.create-sm-item', function() {
            var $template = $(this);
            var template = $template.parent().data('template');
            var itemData = template;
            itemData.template = template.id;

            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                var item = items[0];
                self.last_smtemplate = item.template;
                var $item = renderSelfMonitorItemHtml(self, item);
                prependSelfMonitorItemToList(self, $item);
                $('#self-monitor-templates-modal').modal('hide');

                var selector = $item.find('.selector');
                var attrState = selector.attr('state');
                var $box = selector.closest('.self-monitor-item').find('.self-monitor-box')
                var itemNew = selector.closest('.self-monitor-item').data('item')

                if($box.hasClass('unloaded')){
                    retrieveSelfMonitorItemRequest(self, itemNew, {}, function (response) {
                        renderSelfMonitorItemDetails(self, $box, response)
                        var editformbutton = $item.find('.edit-sm-item-form');
                        editSelfMonitorItemForm(editformbutton, self);

                        selector.find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                        selector.data('state', 2);
                    })
                }

            });
            return false;
        });

        self.$selfmonitorbox.on('click', '.self-monitor-item-form .p_value', function() {
            var selector = $(this).closest('.self-monitor-item-form').find('.selector')
            var state = selector.data('state');
            if (state!=2)
                selector.click();
        });

        self.$selfmonitorbox.on('click', '.selector', function() {
            var attrState = $(this).attr('state');
            var $box = $(this).closest('.self-monitor-item').find('.self-monitor-box')
            var item = $(this).closest('.self-monitor-item').data('item')
            if($box.hasClass('unloaded')){
                retrieveSelfMonitorItemRequest(self, item, {}, function (response) {
                    renderSelfMonitorItemDetails(self, $box, response)
                })
            }
            if (attrState==2){
                $(this).data('state', 2);
                $(this).attr('state', 1);
            }

            var state = $(this).data('state');
            console.log(state)
            switch(state){
                case 1 :
                case undefined :
                    $(this).find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $(this).parent().find('.self-monitor-box').removeClass('hide');
                    $(this).data('state', 2);
                    break;
                case 2 :
                    $(this).find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(this).parent().find('.self-monitor-box').addClass('hide');
                    $(this).data('state', 1);
                    break;
            }
        });
        self.$selfmonitorbox.on('click', '.diary-item .date, .diary-item .poject_title', function() {
            var state = $(this).closest('.diary-item').find('.selector').data('state');
            if (state!=2)
                $(this).closest('.diary-item').find('.selector').click();
        });
        self.$selfmonitorbox.on('click', '.edit-sm-item-form', function() {
            //editSelfMonitorItemForm($(this), self);
            editSelfMonitorItemFormWithData($(this), self);
        });
        self.$selfmonitorbox.on('click', '.save-sm-item-form', function() {
            var $button = $(this);
            var $item = $(this).closest('.self-monitor-item');
            var item = $item.data('item');
            var currenddatetime = moment().format('DD.MM.YYYY HH:mm');

            $item.find(".dateEditValue").val(currenddatetime);

            var $form = $item.find('.self-monitor-item-form');
            var changes = $form.formParams();
            var data = prepareSelfMonitorFormData(self, changes, item);
            //console.log(item);
            //console.log(changes);
            //console.log(data);

            updateSelfMonitorItemRequest(self, item, data, function (updatedItem) {
                $item.data('item', updatedItem);
                $button.hide();
                $item.find('.edit-sm-item-form').show();
                $item.find(".imgcheck-checkbox").each(function() {
                    $(this).addClass("hide");
                });


                $item.find( ".readonly" ).each(function() {
                    $(this).addClass("hide");
                    $(this).parent().find('.text-value').text($(this).val()).removeClass("hide");
                });
                $item.find(".imgcheck").each(function() {
                    var checked = $(this).parent().parent().find('.imgcheck-checkbox-live');
                    if (checked.is(":checked") == true){
                        $(this).removeClass("hide");
                    }else{
                        $(this).addClass("hide");
                    }
                });

                $item.find(".imgcheck-unactive").each(function() {
                    var checked = $(this).parent().parent().find('.imgcheck-checkbox-live');
                    if (checked.is(":checked") == true){
                        $(this).addClass("hide");
                    }else{
                        $(this).removeClass("hide");
                    }
                });

                $item.find(".imgcheck-border").each(function() {
                    $(this).removeClass("hide");
                });
                $item.find(".p_edit").each(function() {
                    $(this).addClass("hide");
                });
                $item.find(".p_value").each(function() {
                    var text = $(this).parent().find('.p_edit').val();
                    //console.log(text);
                    $(this).removeClass("hide").text(text);
                    if (text!=''){
                        $item.find('.date').hide();
                        $item.find('.poject_title').show();
                    }else{
                        $item.find('.date').show();

                    }

                });

            });
        });
        self.$selfmonitorbox.on('click', '.show-sm-templates', function() {
            var html = $('#self-monitor-templates').render();

            var height = parseInt(self.windowCoBaseHeight / 1.5,10);


            $('#self-monitor-templates-modal .block-content').html(html);


            var $box = $('.choose-templates');
            $.each(self.smtemplates, function (k, template) {
                if(template){
                    var $template = renderSelfMonitorTemplateHtml(self, template);
                    $box.find('.sm-templates-list').append($template);
                }
            });


            if (isMobile('any')) {
                let pbottom = self.windowCoBaseHeight / 2
                $('#self-monitor-templates-modal').find('.block-content').css('height',self.modalContentHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            }else{
                $('#self-monitor-templates-modal').css('overflow','auto')
                $('#self-monitor-templates-modal').find('.block-content').css('min-height','450px')
            }

            $('#self-monitor-templates-modal').modal('show');
        });
        self.$selfmonitorbox.on('click', '.create-sm-item-last-template', function() {
            var template = self.last_smtemplate;
            var itemData = template;
            itemData.template = template.id;

            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                var item = items[0];
                var $item = renderSelfMonitorItemHtml(self, item);
                prependSelfMonitorItemToList(self, $item);
                var editformbutton = $item.find('.edit-sm-item-form');
                editSelfMonitorItemForm(editformbutton, self);
            });
            return false;
        });

        $(document).on('click', '.checkbox1click', function() {
            var lavel = $(this).attr('branch');
            var box = $(this).parent().parent().parent().parent().parent();

            if ( $(this).is(":checked") == true ) {
                box.find('.checkbox1_lavel_'+lavel).first().show();
            } else {
                box.find('.checkbox1_lavel_'+lavel).hide();
                box.find('.checkbox1_lavel_'+lavel).find('.imgcheck-checkbox-live').removeAttr('checked');
            }
        });
        $(document).on('click', '.checkbox2click', function() {
            var lavel = $(this).attr('branch');
            var box = $(this).parent().parent().parent().parent().parent();

            if ( $(this).is(":checked") == true ) {
                box.find('.checkbox2_lavel_'+lavel).first().show();
            } else {
                box.find('.checkbox2_lavel_'+lavel).hide();
                box.find('.checkbox2_lavel_'+lavel).find('.imgcheck-checkbox-live').removeAttr('checked');
            }
        });
        $(document).on('click', '.add-one-more', function() {
            $(this).hide();
            $(this).parent().find('.additional-checkbox').removeClass('hide');
        });
        $(document).on('click', '.add-sub-field', function() {
            self.addnewsubfield($(this));
        });
        $(document).on('click', '.remove-field', function() {
            self.removefield($(this));
        });
        $(document).on('keyup', '.checkbox1_name', function() {
            //$(this).parent().find('.checkbox1').prop('checked',true);
            var text = $(this).val();
            var field_type_data = $(this).parent().parent().parent().parent().find('.field_type_data').first();
            field_type_data.find('.checkbox1_name_temp').val(text);

            //if (text == '')
            //    field_type_data.find('.checkbox1_temp').val('notchecked');
            //else
            //    field_type_data.find('.checkbox1_temp').val('checked');
        });
        $(document).on('keyup', '.checkbox2_name', function() {
            var text = $(this).val();
            var field_type_data = $(this).parent().parent().parent().parent().find('.field_type_data').first();
            field_type_data.find('.checkbox2_name_temp').val(text);
        });
        $(document).on('keyup', '.checkbox_text', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().find('.field_type_data').find('.checkbox_text_temp').val(text);
        });

        $(document).on('click', '.checkbox1', function() {

            // click in check
            var item = $(this).parent().parent().parent().parent().parent();

            if ( $(this).is(":checked") == true ) {
                item.find('.field_type_data').first().find('.checkbox1_temp').val('checked');
                $(this).parent().parent().find('.sub-field-1').show();
            } else {
                item.find('.field_type_data').first().find('.checkbox1_temp').val('notchecked');
                $(this).parent().parent().find('.sub-field-1').hide();
                var lavel = item.attr('lavel');
                item.find('.checkbox1_lavel_'+lavel).remove();
            }
        });
        $(document).on('click', '.checkbox2', function() {
            var item = $(this).parent().parent().parent().parent().parent();
            if ( $(this).is(":checked") == true ) {
                item.find('.field_type_data').first().find('.checkbox2_temp').val('checked');
                $(this).parent().parent().find('.sub-field-2').show();
            } else {
                item.find('.field_type_data').first().find('.checkbox2_temp').val('notchecked');
                $(this).parent().parent().find('.sub-field-2').hide();
                var lavel = item.attr('lavel');
                item.find('.checkbox2_lavel_'+lavel).remove();
            }
        });
        $(document).on('keyup', '.textfield', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().parent().find('.textfield_temp').val(text);
        });
        $(document).on('keyup', '.text', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().parent().find('.text_temp').val(text);
        });
        $(document).on('click', '.edit-sm-template', function() {
            var $button = $(this);
            var $template = $button.closest('.self-monitor-template');
            var template = $template.data('template');
            //console.log(template);
            $('#self-monitor-templates-modal').modal('hide');
            selfMonitorTemplateForm(self, template);
        });
        $(document).on('click', '.remove-sm-template', function() {
            var $button = $(this);
            var $template = $button.closest('.self-monitor-template');
            var template = $template.data('template');


            swal({
                title: gettext("Are you sure?"),
                text: gettext("You will not be able to recover this template!"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Yes, delete it!"),
                cancelButtonText: gettext("No, cancel!"),
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm){
                if (isConfirm) {
                    removeSelfMonitorTemplateRequest(self, template.urls.remove, function () {
                        swal({
                            title: gettext('Deleted!'),
                            text: gettext("Your template has been deleted."),
                            type: "success",
                            timer: 1500,
                            showConfirmButton: false
                        })

                        removeTemplateFromArray(self, template);
                        $template.remove();

                        var itemsCount = $('.sm-templates-list').find('.self-item').length;
                        if(itemsCount==0){
                            self.$selfmonitorbox.find('.create-sm-item-last-template').hide();
                            $('#self-monitor-templates-modal').modal('hide');
                        }
                    });

                } else {
                    swal(gettext("Cancelled"), gettext("Your template is safe :)"), "error")
                }
            })

        });
        $(document).on('click', '.save-sm-template', function() {
            var $box = $('.self-monitor-edit-template');
            var $form = $('#self-monitor-edit-template-form');
            var $button = $(this);
            $form.validator().on('submit', function (e) {
                if (e.isDefaultPrevented()) {
                // handle the invalid form...
                } else {
                    $form.find('input[type="text"]').each( function () {
                        if ($(this).val()=='') $(this).val(' ');
                    });

                    var formData = $form.formParams();
                    if (formData.action == 'add'){
                        createSelfMonitorTemplateRequest(self, {data:JSON.stringify([formData])}, function(templates){
                            var template = templates[0];
                            self.smtemplates.push(template);
                            var itemData = formData;
                            itemData.template = template.id;
                            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                                var item = items[0];
                                self.last_smtemplate = item.template;
                                var $item = renderSelfMonitorItemHtml(self, item);
                                prependSelfMonitorItemToList(self, $item);
                                $('#self-monitor-edit-modal').modal('hide');
                                var editformbutton = $item.find('.edit-sm-item-form');
                                editSelfMonitorItemForm(editformbutton, self);
                            });
                        });
                    }
                    if (formData.action == 'edit'){
                        var template = $box.data('template');
                        formData.data = JSON.stringify(formData.data);
                        updateSelfMonitorTemplateRequest(self, template.urls.update, formData, function(updated_template){
                            removeTemplateFromArray(self, template);
                            self.smtemplates.push(updated_template);
                            $('#self-monitor-edit-modal').modal('hide');
                        });
                    }
                    self.$selfmonitorbox.find('.create-sm-item-last-template').show();
              }
              return false;
            });
        });

        $(document).on('click', '.remove-sm-item', function() {
            var $button = $(this);
            var $item = $button.closest('.self-monitor-item');
            var item = $item.data('item');

                    swal({
                        title: gettext("Are you sure?"),
                        text: gettext("You will not be able to recover this form!"),
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: gettext("Yes, delete it!"),
                        cancelButtonText: gettext("No, cancel!"),
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function(isConfirm){
                        if (isConfirm) {
                            removeSelfMonitorItemRequest(self, item, function (item) {
                                $item.remove();
                                swal({
                                    title: gettext('Deleted!'),
                                    text: gettext("Your form has been deleted."),
                                    type: "success",
                                    timer: 1500,
                                    showConfirmButton: false
                                })
                            });
                        } else {
                            swal(gettext("Cancelled"), gettext("Your form is safe :)"), "error")
                        }
                    })
        });
    }
    var renderSelfMonitorTemplateHtml = function (self, template) {
        var html = $('#self-monitor-template').render({
            template: template,
            User : self.user
        });
        var $template = $(html);
        if(self.user.id != template.owner.id){
            $template.find('.edit-sm-template').hide();
            $template.find('.remove-sm-template').hide();
        }
        $template.data('template', template);
        return $template;
    }
    var createSelfMonitorTemplateRequest = function(self, data, callback){
        $.ajax({
            url: CustomFormsUrls.api.templates,
            data:data,
            type: 'post',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var updateSelfMonitorTemplateRequest = function (self, url, data, callback) {
        $.ajax({
            url: url,
            type: 'put',
            data:data,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var createSelfMonitorItemRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsCustomForms(self.project.id),
            data:data,
            type: 'post',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveSelfMonitorTemplates = function(self){
        var ownerids = []
        for(let companyUser of self.user['companyusers']){
            if(companyUser.user_id){
                ownerids.push(companyUser.user_id)
            }
        }
        ownerids = ownerids.join(',')
        $.ajax({
            url: CustomFormsUrls.api.templates,
            data:{ownerids:ownerids},
            type: 'get',
            async: false,
            success: function (response) {
                self.smtemplates = response
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveSelfMonitorItemsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsCustomForms(self.project.id),
            data:data,
            type: 'get',
            async: false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveSelfMonitorItemRequest = function(self, item, data, callback){
        $.ajax({
            url: CustomFormsUrls.api.item(item.id),
            data:data,
            type: 'get',
            async: false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var refreshSelfMonitorList = function(self, params){
        var $smreports = self.$selfmonitorbox.find('.self-monitor-items');

        retrieveSelfMonitorItemsRequest(self, params, function(response){
            var $items = renderSelfMonitorItemsHtml(self, response.data, response.keys);

            if ($smreports.find('.self-monitor-item').length) {
                $smreports.jsonscroll.destroy();
                $smreports.find('.jsonscroll-loading').remove();
            }
            $smreports.find('.self-monitor-item').remove()
            $smreports.find('.clear').remove()

            $smreports.append($items);
            $smreports.jsonscroll({
                nextSelector: 'a.jscroll-next:last',
                contentHandler: function(response){
                    return renderSelfMonitorItemsHtml(self, response.data, response.keys);
                }
            });
        });
    }
    var renderSelfMonitorItemsHtml = function (self, items, keys) {
        var data = [];
        $.each(items, function (k, item) {
            var $item = renderSelfMonitorItemHtml(self, item, keys);
            data.push($item);
        });
        return data;
    }
    var renderSelfMonitorItemHtml = function(self, item, keys){
        var html = $('#self-monitor-item-template').render({
            item : item,
            project: self.project,
            keys: keys
        });

        var $item = $(html);
        $item.data('item', item);
        return $item;
    }
    var renderSelfMonitorItemDetails = function(self, $box, item){
        var formFieldsHtml = makeSelfMonitorFormFieldsHtml(self, item.data);
        var html = $('#self-monitor-item-details-template').render({
            formFields: formFieldsHtml,
            item : item,
            project: self.project
        });

        var $details = $(html);

        if (self.isProjectArchived){
            $details.find('.edit-sm-item-form').hide()
            $details.find('.remove-sm-item').hide()
        }

        $box.empty().append($details)
        $box.removeClass('unloaded')
        $box.closest('.self-monitor-item').data('item', item);
    }
    var makeSelfMonitorFormFieldsHtml = function(self, data){
        //console.log(data);
        var fields = '';
        var htmltemp = '';
        var objecthtmltemp = {};
        var date_edit = '';
        var projectUsers = self.project.getUsersObject()
        console.log(projectUsers)
        var userinfo
        if (typeof data.date_edit != 'undefined')
            date_edit = data.date_edit;


        if( typeof data.field_type == 'string'){
            var renderData = {};
            renderData.index = 0;
            renderData.branch = data.branch;
            renderData.parent_branch = data.parent_branch;
            renderData.field_type = data.field_type;
            renderData.checkbox_text = data.checkbox_text_temp;
            renderData.checkbox1_name = data.checkbox1_name_temp;
            renderData.checkbox2_name = data.checkbox2_name_temp;

            if (typeof data.checkbox1_temp == 'object')
                renderData.checkbox1 = data.checkbox1_temp[0];
            else if (data.checkbox1_temp=='n')
                renderData.checkbox1 ='notchecked';
            else
                renderData.checkbox1 = data.checkbox1_temp;

            if (typeof data.checkbox2_temp == 'object')
                renderData.checkbox2 = data.checkbox2_temp[0];
            else if (data.checkbox2_temp == 'n')
                renderData.checkbox2 = 'notchecked';
            else
                renderData.checkbox2 = data.checkbox2_temp;

            renderData.textfield = data.textfield_temp;
            renderData.text = data.text_temp;
            renderData.active_checkbox = data.active_checkbox;
            renderData.show_item_by_checkbox = data.show_item_by_checkbox;


            if (typeof data.checkbox1_user_id != 'undefined'){
                renderData.checkbox1_user_id = data.checkbox1_user_id[0];
                if(renderData.checkbox1_user_id>0){
                    userinfo = projectUsers[renderData.checkbox1_user_id];
                    renderData.checkbox1_user_name = userinfo.user.name;
                }
            }
            if (typeof data.checkbox2_user_id != 'undefined'){
                renderData.checkbox2_user_id = data.checkbox2_user_id[0];
                if(renderData.checkbox2_user_id>0){
                    userinfo = projectUsers[renderData.checkbox2_user_id];
                    renderData.checkbox2_user_name = userinfo.user.name;
                }
            }


            if (typeof data.checkbox1_temp_edit_date != 'undefined')
                renderData.checkbox1_temp_edit_date = data.checkbox1_temp_edit_date[0];
            if (typeof data.checkbox2_temp_edit_date != 'undefined')
                renderData.checkbox2_temp_edit_date = data.checkbox2_temp_edit_date[0];
            if (typeof data.textfield_value_temp != 'undefined')
                renderData.textfield_value = data.textfield_value_temp;
            if (typeof data.text_value_temp != 'undefined')
                renderData.text_value = data.text_value_temp;
            //console.log(renderData);
            var itemHtml = $('#self-monitor-form-fields-template').render({data: renderData, date_edit: date_edit});
            fields = fields + itemHtml;
        }else{
            $(data.field_type).each(function(index, field_type){
                var renderData = {};
                renderData.index = index;
                renderData.branch = data.branch[index];
                renderData.parent_branch = data.parent_branch[index];
                renderData.field_type = field_type;
                renderData.checkbox_text = data.checkbox_text_temp[index];
                renderData.checkbox1_name = data.checkbox1_name_temp[index];
                renderData.checkbox1 = data.checkbox1_temp[index];
                renderData.checkbox2_name = data.checkbox2_name_temp[index];
                renderData.checkbox2 = data.checkbox2_temp[index];
                renderData.textfield = data.textfield_temp[index];
                renderData.text = data.text_temp[index];
                renderData.active_checkbox = data.active_checkbox[index];
                if (typeof data.checkbox1_temp_edit_date != 'undefined')
                    renderData.checkbox1_temp_edit_date = data.checkbox1_temp_edit_date[index];
                if (typeof data.checkbox2_temp_edit_date != 'undefined')
                    renderData.checkbox2_temp_edit_date = data.checkbox2_temp_edit_date[index];

                if (typeof data.checkbox1_user_id != 'undefined'){
                    renderData.checkbox1_user_id = data.checkbox1_user_id[index];
                    if(renderData.checkbox1_user_id>0){
                        userinfo = projectUsers[renderData.checkbox1_user_id];
                        renderData.checkbox1_user_name = userinfo.user.name;
                    }
                }
                if (typeof data.checkbox2_user_id != 'undefined'){
                    renderData.checkbox2_user_id = data.checkbox2_user_id[index];
                    if(renderData.checkbox2_user_id>0){
                        userinfo = projectUsers[renderData.checkbox2_user_id];
                        renderData.checkbox2_user_name = userinfo.user.name;
                    }
                }


                if (renderData.branch==3){
                    var active_checkbox_additional = renderData.active_checkbox.slice(0, -1);
                    var parent_parent_branch = renderData.parent_branch - 1;
                    renderData.active_checkbox = renderData.active_checkbox+' '+active_checkbox_additional+parent_parent_branch;
                }

                renderData.show_item_by_checkbox = data.show_item_by_checkbox[index];


                if (typeof data.textfield_value_temp != 'undefined')
                    renderData.textfield_value = data.textfield_value_temp[index];
                if (typeof data.text_value_temp != 'undefined')
                    renderData.text_value = data.text_value_temp[index];

                //console.log(renderData);

                var itemHtml = $('#self-monitor-form-fields-template').render({data: renderData, date_edit: date_edit});

                if (renderData.parent_branch == 0){
                    objecthtmltemp = $('<div class="main-item-box">'+itemHtml+'</div>');
                    if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] ==0 ){
                        fields = fields + objecthtmltemp[0].outerHTML;
                    }
                }else{
                    objecthtmltemp.append(itemHtml);
                    if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] ==0 ){
                        fields = fields + objecthtmltemp[0].outerHTML;
                    }
                }
            });

        }
        var html = '<div>'+fields+'</div>'
        var object = $('<div/>').html(html).contents();



        var mainbox = object.find('.main-item-box');
        $.each(mainbox, function () {
            var mainboxobject = $(this);

            var checkbox1click = mainboxobject.find('.checkbox1click');
            $.each(checkbox1click, function () {
                if ( $(this).is(":checked") == true ) {
                } else {
                    var lavel = $(this).attr('branch');
                    mainboxobject.find('.checkbox1_lavel_'+lavel).hide();
                }
            });

            var checkbox2click = mainboxobject.find('.checkbox2click');
            $.each(checkbox2click, function () {
                if ( $(this).is(":checked") == true ) {
                } else {
                    var lavel = $(this).attr('branch');
                    mainboxobject.find('.checkbox2_lavel_'+lavel).hide();
                }
            });
        });



        return object.html() + '<div class="border-bottom"></div>';
    }
    var prepareSelfMonitorFormData = function(self, changes, item){
        var result = {};
        var data = item.data;

        if("checkbox1_temp" in changes){
            $.each(changes.checkbox1_temp, function (key, value) {
                if(value){
                   changes.checkbox1_temp[key] = 'checked';
                }else{
                   changes.checkbox1_temp[key] = 'notchecked';
                }
            });
        }
        if("checkbox2_temp" in changes){
            $.each(changes.checkbox2_temp, function (key, value) {
                if(value){
                   changes.checkbox2_temp[key] = 'checked';
                }else{
                   changes.checkbox2_temp[key] = 'notchecked';
                }
            });
        }
        $.each(changes, function (k, v) {
           if(k == 'name' || k == 'project_name' || k == 'company_name'){
               result[k] = v;
           }else{
               data[k] = v;
           }
        });
        result['data'] = JSON.stringify(data);

        return result;
    }
    var prependSelfMonitorItemToList = function(self, $item){
        $item.find('.selector').attr('state', 2);
        $item.find('.selector').find('img').attr('src','/static/img/down.svg');
        $item.find('.self-monitor-item-content').removeClass('hide');
        var $box = self.$selfmonitorbox.find('.self-monitor-items');

        var $jsoncrollBox = $box.find('.jsonscroll-inner');
        if($jsoncrollBox.length){
            $jsoncrollBox.find('.date-filter').after($item);
        }else{
            $box.find('.date-filter').after($item);
        }
    }
    var removeSelfMonitorItemRequest = function (self, item, callback) {
        $.ajax({
            url: CustomFormsUrls.api.item(item.id)+'?'+ $.param({'jssid': '12345'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var removeSelfMonitorTemplateRequest = function (self, url, callback) {
        $.ajax({
            url: url+'?'+ $.param({'jssid': '12345'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var updateSelfMonitorItemRequest = function (self, item, data, callback) {
        $.ajax({
            url: CustomFormsUrls.api.item(item.id),
            type: 'put',
            data:data,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var removeTemplateFromArray = function (self, template) {
        $.each(self.smtemplates, function (i, t) {
            if(t && t.id == template.id){
                delete self.smtemplates[i]
            }
        });
    }

    ProjectReportsForManager  = createClass({
        construct : function(options) {

            this.modalContentHeight = options.modalContentHeight
            this.windowCoBaseHeight = options.windowCoBaseHeight
            this.NewDesignCoBaseSetHeight = options.NewDesignCoBaseSetHeight
            this.blockHeadeIOSApp = options.blockHeadeIOSApp
            this.project = options.project
            this.user = options.user;
            this.isProjectArchived = this.project.statusForUser(this.user.id) == 'archived'
            this.isProjectActive = this.project.statusForUser(this.user.id) == 'active'
            this.urls = options.urls;
            this.smtemplates = [];
            this.last_smtemplate = options.last_smtemplate;
            this.$box = $(options.box);
            this.$diarybox = this.$box.find('.diary-box');
            this.$projectlogsreportsbox = this.$box.find('.projectlogsreports-box');
            this.$selfmonitorbox = this.$box.find('.self-monitor-box');
            this.number = 1;
            this.uploadconf = {
                accept_file_types: /(\.|\/)(jpe?g|png)$/i,
                accept_file_extensions: /(\.jpg|\.jpeg|\.png)$/i,
                max_file_size: '50MB'
            };
            this.retrieveDiaryDayParams = {}
        },
        run: function() {
            var self = this;
            self.setHeight(this.$box);
            bindTabs(self);

            var tab = getUrlHash();
            if(!tab || !tab.length){
                tab = 'diary-box';
            }
            self.showTab(tab);


            if (isMobile('any') && isTimeFieldSupported()) {
                var duration_finished = $('.duration_finished')
                duration_finished.removeAttr('readonly').prop('type', 'time')
            }else{
                $("#dtBox").DateTimePicker({
                    addEventHandlers: function(){
                        var dtPickerObj = this;
                        $(document).on('click','#id-duration',function(e){
                            e.stopPropagation();
                            dtPickerObj.showDateTimePicker($("#id-duration"));
                        });
                        $(document).on('click','.worker-time-input',function(e){
                            e.stopPropagation();
                            dtPickerObj.showDateTimePicker($(".worker-time-input"));
                        });
                    }
                });
            }

            retrieveSelfMonitorTemplates(self)
        },
        setHeight : function($box) {
            var self = this;

            var tabsHeight = 50;

            var height = self.windowCoBaseHeight - self.NewDesignCoBaseSetHeight - tabsHeight;
            $box.find('.diary-list, .self-monitor-list, .projectlogsreports-box').css('height',height+'px');

            $(window).resize(function () {
                var height = self.windowCoBaseHeight - self.NewDesignCoBaseSetHeight - tabsHeight;
                $box.find('.diary-list, .self-monitor-list, .projectlogsreports-box').css('height',height+'px');
            });

            if (isMobile('any'))
                $('.pagecontent').css('width','100%')
        },
        showProjectUserLogCoords: function(url) {
            var height = this.windowCoBaseHeight - this.NewDesignCoBaseSetHeight
            var html = '<iframe style="height:'+height+'px;width:100%;" frameborder="0" allowfullscreen="" src="'+url+'"></iframe>'
            var $modal = $('#project-user-log-coords-modal')
            if (isMobile('any')) {
                $modal.find('.block-content').css('height', this.modalContentHeight+'px').addClass('setScrollBar')
            }
            $modal.find('.block-content').html(html)
            $modal.modal('show')
        },
        showTab: function(tab){
            var self = this;
            var $tab=self.$box.find('a[data-id='+tab+']');
            if($tab.length){
                $tab.click();
            }
        },
        scrollToBottom: function(elem){
          elem.animate({
            scrollTop: elem[0].scrollHeight
          },'slow');
        },
        addfield: function() {
            var data = {branch:1};
            var html = $('#field-template').render({data: data});
            var $field = $(html);
            var filedhtml = this.getField('checkbox');
            $field.addClass('border-bottom').attr('number',this.number).find('.fielddata').html(filedhtml);
            $field.find('.subfield_value_title').hide();
            html = $field[0].outerHTML;
            $('.fields').append(html);


            this.number = this.number + 1;
            $('.self-monitor-edit-template').find('.save-sm-template').removeClass('hide');
            $('.self-monitor-edit-template').find('.save-sm-template-cancel').removeClass('hide');
            $('.self-monitor-edit-template').find('.fields').show();

            //scroll botoom
            var blockContent = $('.self-monitor-edit-template').closest('.block-content')
            //this.scrollToBottom(blockContent)
            var lastLi = $('.fields li').last()
            blockContent.scrollTo(lastLi, {duration: 800, offsetTop : '137'})

        },
        addnewsubfield: function(obj) {
            //console.log('addnewsubfield');
            var self = this;
            var data = {};

            var item = obj.parent().parent().parent().parent();

            var lavel = item.attr('lavel');
            lavel = parseInt(lavel,10);
            if (lavel > 2) return;
            //console.log(lavel);
            var lavelForNames = self.getArrayFromLavel(lavel);
            //console.log(lavelForNames);

            var box = item.find('.subfields-'+lavel);

            var newlavel = lavel + 1;

            var html = $('#field-template').render({data: data});
            var filedhtml = this.getField('checkbox');
            var $field = $(html);
            $field.find('.fielddata').html(filedhtml);
            $field.attr('lavel',newlavel);

            $field.find('.subfields').addClass('subfields-'+newlavel);
            $field.find('.subfields').removeClass('subfields-'+lavel).removeClass('subfields-1');

            var parent_branch = newlavel - 1;
            $field.find('.parent_branch').attr('value',parent_branch);
            $field.find('.branch').attr('value',newlavel);
            if (lavel == 2){
                $field.find('.add-sub-field').addClass('hide');
            }

            if (obj.hasClass('sub-field-1')){
                var subfield = obj.parent().find('.checkbox1_name').val();
                if (subfield=='') subfield = gettext('Option 1');
                $field.find('.subfield_name').attr('value',subfield);
                $field.find('.subfield_value_title').show();
                $field.find('.subfield_value').text(subfield);
                $field.find('.active_checkbox').attr('value','checkbox1_lavel_'+lavel);
                $field.find('.show_item_by_checkbox').attr('value','show');

                $field.addClass('checkbox1_lavel_'+lavel);
            }
            if (obj.hasClass('sub-field-2')){
                var subfield = obj.parent().find('.checkbox2_name').val();
                if (subfield=='') subfield = gettext('Option 2');
                $field.find('.subfield_name').attr('value',subfield);
                $field.find('.subfield_value_title').show();
                $field.find('.subfield_value').text(subfield);
                $field.find('.active_checkbox').attr('value','checkbox2_lavel_'+lavel);
                $field.find('.show_item_by_checkbox').attr('value','show');

                $field.addClass('checkbox2_lavel_'+lavel);
            }
            html = $field[0].outerHTML;
            box.append(html);

        },
        removefield: function(obj) {
            obj.parent().parent().remove();
        },
        getField: function(fieldtype){
            var html = $('#'+fieldtype+'-template').render({ data: {} });
            return html;
        },
        setField: function(field){
            var filedhtml = this.getField(field.val());
            field.parent().parent().find('.fielddata').html(filedhtml);
            field.parent().parent().find('.subfields').html('');
        },
        getArrayFromLavel: function(lavel){
            var string = '';
            for (var i=1;i<=lavel;i++){
                string = string + '[]';
            }
            return string;
        },
        setUpdateDateForCheckbox: function(obj){
            var self = this;
            var currenddatetime = moment().format('DD.MM.YYYY HH:mm');
            obj.parent().parent().find('.checkbox1_temp_edit_date, .checkbox2_temp_edit_date').val(currenddatetime);
            obj.parent().parent().find('.dateEdit').text(currenddatetime);

            var name = self.user.name;
            var user_id = self.user.id;
            obj.parent().parent().find('.userName').text(name);
            obj.parent().parent().find('.checkbox1_user_id, .checkbox2_user_id').val(user_id);
        }
    });
})();

var ProjectReportsForWorker = null;
(function() {
    var removeProjectTaskFileRequest = function (self, url, callback) {
        $.ajax({
            url: url+'?'+ $.param({jssid: '12345'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var bindRemoveProjectTaskImage = function(self, $file){
        var file = $file.data('file');
        if (file.owner_id != this.user.id) {
            $file.find('.remove-file-btn').hide()
        } else {
            $file.find('.remove-file-btn')
                .data('file', file)
                .show()
                .click(function (event) {
                    var $button = $(this);
                    var $file = $button.closest('.project-task-image');
                    var file = $file.data('file');

                    swal({
                        title: gettext("Are you sure?"),
                        text: gettext("You will not be able to recover this imaginary file!"),
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: gettext("Yes, delete it!"),
                        cancelButtonText: gettext("No, cancel!"),
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function(isConfirm){
                        if (isConfirm) {
                            removeProjectTaskFileRequest(self, ProjectsUrls.api.projectTaskImage(self.project.id, file.id), function (response) {
                                $file.remove();
                                swal({
                                    title: gettext('Deleted!'),
                                    text: gettext("Your imaginary file has been deleted."),
                                    type: "success",
                                    timer: 1500,
                                    showConfirmButton: false
                                })
                            });
                        } else {
                            swal(gettext("Cancelled"), gettext("Your imaginary file is safe :)"), "error")
                        }
                    })
                    return false;
                });
        }
    }
    var renderProjectTaskImage = function (self, file) {
        var $file = $($('#project-task-image-update-template').render({file:file}));
        $file.data('file', file);
        $file.find('.file-size').text(bytesToSize(file.size));

        //file from server
        if (file.id) {
            refreshProjectTaskImage(self, $file);

            //bindRemoveProjectTaskImage(self, $file);
        } else {
            //uploading file
            $file.find('.file-name').text(file.name);
        }

        return $file;
    }
    var refreshProjectTaskImage = function(self, $file){
        var file = $file.data('file');
        //console.log(file)
        $file.find('.file-name').text(file.name);

        if (file.type == 'image') {
            $file.find('.file-thumb').attr('src', file.thumbs.x.src).show();
            var datasize = file.thumbs.big.width+'x'+file.thumbs.big.height;
            $file.find('.file-thumb').parent().attr('href', file.thumbs.big.src).attr('data-size', datasize).show();
        }
        initPhotoSwipeFromDOM('.my-gallery');
    }
    var findProjectTaskImageIds = function(self, $box){
        var images = []
        var $images = $box.find('figure.project-task-image');
        $images.each(function(k, v){
            var $image = $(v);
            var image = $image.data('file');
            if(image.status == 'ready'){
                images.push(image.id)
            }
        });
        return images;
    }
    var renderDiaryTab = function(self) {
        bindDiaryItemButtons(self);
        refreshDiaryList(self);
    }
    var refreshDiaryList = function(self, params) {
        var $diaryitems = self.$diarybox.find('.diaryweeks');

        retrieveDiaryItemsRequest(self, params, function(response){
            var $items = renderDiaryItemsHtml(self, response.data, response.keys);
            if(params){
                self.retrieveDiaryDayParams = params;
            }

            if ($diaryitems.find('.diary-week').length) {
                $diaryitems.jsonscroll.destroy();
                $diaryitems.find('.jsonscroll-loading').remove();
            }
            $diaryitems.find('.diary-week').remove()
            $diaryitems.find('.clear').remove()

            $diaryitems.append($items);
            $diaryitems.find('.selector:first').trigger('click')
            $diaryitems.jsonscroll({
                nextSelector: 'a.jscroll-next:last',
                contentHandler: function(response){
                    return renderDiaryItemsHtml(self, response.data, response.keys);
                }
            });
        });
    }
    var bindCreateDiaryTaskFormButtons = function(self){
        var $form = $('#add-diary-task-form')
        $form.find('.extra-work-task-btn-box').hide()
        $form.find('.task-type').hide()
        $form.on('click', '.cancel-add-diary-task-btn', function() {
            $form.modal('hide')
        });
        $form.on('click', '.add-diary-task-btn', function() {
            var data = $form.find('form').serializeArray();
            var date = $form.find('.task-date').val()
            var dateId = date.split("-").join("")

            $.each(data, function(k, v){
                if(v['name'] == 'finished'){
                    if(!v['value'].length){
                        v['value'] = '00:00'
                    }
                    v['value'] = date +'T'+ v['value'];
                }
            });

            data.push({name:'images', value:JSON.stringify(findProjectTaskImageIds(self, $form))});
            data.push({name:'created', value: date +'T00:00'})
            data = prepareDiaryTaskFormData(self, data);
            data.push({name: 'deleted', value: date+'T23:59'});
            createDiaryTaskRequest(self, data, function (task) {
                retrieveDiaryDayDataRequest(self, ProjectsUrls.api.projectReportsDiaryday(self.project.id, date), function(data){
                    var $day = renderDiaryItemDayDataHtml(self, date, data);
                    self.$diarybox.find('.diary-day-items-'+dateId).empty().append($day)
                    initPhotoSwipeFromDOM('.my-gallery');
                    $('#add-diary-task-form').modal('hide');
                });
            });
        });

        if (!isMobile('iOS'))
            $form.find('.fileupload').attr('multiple')

        $form.find('.fileupload')
            .fileupload({
                dataType: 'json',
                singleFileUploads: true,
                autoUpload: true,
                add: function (e, data) {
                    var uploadUrl = ProjectsUrls.api.projectTaskImages(self.project.id)
                    var jsguid = guid();
                    var error = null;

                    data.url = uploadUrl;
                    data.formData = {'jssid': '1234', jsguid:jsguid};
                    $.each(data.files, function (index, file) {
                        if (file.type.length && !self.uploadconf.accept_file_types.test(file.type)) {
                            error = 'Not an accepted file type: ' + file.type;
                        }
                        if (file.name.length && !self.uploadconf.accept_file_extensions.test(file.name)) {
                            error = 'Not an accepted filename: ' + file.name;
                        }
                        if (file.size && file.size > self.uploadconf.max_file_size) {
                            error = 'Filesize is too big. Allowed ' + bytesToSize(self.max_file_size);
                        }

                        file.jsguid = jsguid;
                        var $file = renderProjectTaskImage(self, file);
                        $form.find('.project-task-images').prepend($file);
                        $file.find('.upload-cancel-btn').show().click(function (e) {
                            data.abort();
                        });
                        $form.find('.progress').show();
                        data.context = $file;

                        if (error) {
                            $file.find('.progress-bar').attr({
                                style: 'width:100%;',
                                'aria-valuenow': 100
                            });
                            $file.addClass('progress-bar-danger');
                            $file.find('.upload-cancel-btn').hide();
                            $file.find('.alert').text(error).show();
                        } else {
                            data.submit();
                        }
                    });
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                done: function (e, data) {
                    var file = data.result;
                    var $file = $(data.context);
                    $file.data('file', file);
                    $file.find('.progress').hide();
                    $file.find('.upload-cancel-btn').hide();
                    refreshProjectTaskImage(self, $file);
                    bindRemoveProjectTaskImage(self, $file);
                    initPhotoSwipeFromDOM('.my-gallery');
                },
                progress: function (e, data) {
                    var $progress = $('.progress')
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $progress.find('.persent').text(progress + '%');
                    $progress.find('.progress-bar').attr({
                        style: 'width:' + progress + '%;',
                        'aria-valuenow': progress
                    })
                },
                stop: function (e) {
                    $('.progress').hide()
                    $('.progress .progress-bar').attr({
                        'style': 'width:0',
                        'aria-valuenow': '0'
                    })
                }
            })
            .prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');
    }
    var bindDiaryItemButtons = function(self){
        bindCreateDiaryTaskFormButtons(self)
        self.$diarybox.on('click', '.diary-task-form-btn', function() {
            var $btn = $(this)
            var day = $btn.closest('.diary-day').data('day')
            var $form = $('#add-diary-task-form')

            $form.find('.task-date').val(day.date)
            $form.find('.task-finished').datetimepicker({
                defaultDate:day.date+' 00:00',
                format: 'HH:mm'
            });

            $form.find("input[type=text], textarea").val("");
            $form.find("input[type=checkbox]").prop("checked", false);
            $form.find(".project-task-images").empty()
            $form.find('input.task-user').val(self.user.id);
            $form.find('input.task-user-name').closest('.form-group').hide();
            $form.find("#id-duration input").val("01:00");

            if (isMobile('any')) {
                let pbottom = self.windowCoBaseHeight / 2
                $form.find('.block-content').css('max-height',self.modalContentHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            }else{
                $form.css('overflow','auto')
            }
            $form.modal('show')
        });
        self.$diarybox.on('click', '.selector', function() {
            var state = $(this).data('state');
            var $button = $(this);
            var $day = $(this).parent();
            var day = $day.data('day');
            switch(state){
                case 1 :
                case undefined :
                    $day.find('.info').removeClass('hide');
                    $day.find('.diary-day-data-box').removeClass('hide');
                    $button.find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $button.data('state', 2);

                    if($day.hasClass('loading')){
                        var $dataBox = $day.find('.diary-day-data-box');
                        $dataBox.append('<center><img src="/static/img/loading.gif" /></center>');
                        retrieveDiaryDayDataRequest(self, day.urls.data, function(data){
                            var $data = renderDiaryItemDayDataHtml(self, day, data);
                            $dataBox.empty().append($data);
                            $day.removeClass('loading');
                            initPhotoSwipeFromDOM('.my-gallery');
                        })
                    }

                    break;
                case 2 :
                    $(this).parent().find('.info').addClass('hide');
                    $(this).parent().find('.diary-day-data-box').addClass('hide');
                    $button.find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(this).data('state', 1);
                    break;
            }
        });

        self.$diarybox.on('click', '.diary-item .date', function() {
            var state = $(this).parent().find('.selector').data('state');
            if (state!=2)
                $(this).parent().find('.selector').click();
        });
    }
    var renderDiaryItemsHtml = function (self, items, keys){
        var data = [];
        $.each(items, function (week_number, week_data) {
            if(week_data[0]){
                week_number = week_data[0].week
                var $item = renderDiaryItemHtml(self, week_number, week_data, keys);
                data.unshift($item);
            }
        });
        return data;
    }
    var renderDiaryItemHtml = function(self, week_number, week_days, keys){
        var html = $('#diary-item-template').render({
            week: week_number,
            User: self.user,
            project: self.project,
            keys:keys ? keys : {}
        });
        var $diaryitem = $(html);

        $.each(week_days, function(k, day){
            var $day = renderDiaryItemDayHtml(self, day);
            $diaryitem.find('.diary-week-days').append($day);
        });

        return $diaryitem;
    }
    var renderDiaryItemDayHtml = function(self, day){
        var html = $('#diary-item-day-template').render({
            day: day,
            User:self.user,
            project: self.project
        });
        var $day = $(html);
        $day.data('day', day);
        return $day;
    }
    var renderDiaryItemDayDataHtml = function(self, day, data){
        var html = $('#diary-item-day-data-template').render({
            data: data,
            User:self.user,
            project: self.project
        });

        var $dayData = $(html)

        if (self.isProjectArchived)
            $dayData.find('.diary-task-form-btn').hide()

        var $projectLogsBox = $dayData.find('.diary-day-projectlogs');
        var $userTasksBox = $dayData.find('.diary-day-tasks');

        var $projectLogs = renderProjectLogsDayHtml(self, data)
        $projectLogsBox.append($projectLogs)

        //user`s tasks
        $.each(data.users, function(user_id, user){
            if ($.isNumeric(user_id) && user.tasks.length){
                var $userTasks = renderDiaryUserTasksBoxHtml(self, user);
                var $tasks = $userTasks.find('.diary-tasks');
                $.each(user.tasks, function(t, data){

                    var $task = renderDiaryTaskHtml(self, data, user.user);
                    $tasks.append($task);

                    var $images = $task.find('.project-task-images');

                    if(data.task.files && data.task.files['images']){
                        $.each(data.task.files.images, function (k, image) {
                            var $image = renderProjectTaskImage(self, image);
                            $images.append($image);
                        });
                    }
                });
                if($userTasksBox.length){
                    $userTasksBox.append($userTasks);
                }
            }
        });

        return $dayData;
    }
    var renderDiaryTaskHtml = function(self, data, user){
        var task = data.task;
        var html = $('#diary-task-template').render({
            type: task.type == 'alert' ? 'alert' : 'task',
            task: task,
            data: data,
            user: user,
            project: self.project
        });
        var $task = $(html);
        $task.data('task', data);
        return $task;
    }
    var renderDiaryUserTasksBoxHtml = function(self, user){
        var html = $('#diary-user-tasks-template-worker').render({
            user: user
        });
        var $tasks = $(html);
        if (self.isProjectArchived){

            $tasks.find('.diary-task-form-btn').hide()
            $tasks.find('.diary-user-task-form-btn').hide()
            $tasks.find('.edit-user-task-btn').hide()
        }
        $tasks.data('user', user)
        return $tasks
    }
    var prepareDiaryTaskFormData = function(self, data){
        $.each(data, function(k, item){
            if(item['name'] == 'title' && !item['value'].length){
                item['value'] = 'New Task';
            }
        });
        return data;
    }
    var retrieveDiaryItemsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsDiary(self.project.id),
            data:data,
            type: 'get',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveDiaryDayDataRequest = function(self, url, callback){
        $.ajax({
            url: url,
            type: 'get',
            data: self.retrieveDiaryDayParams,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var renderProjectLogsDayHtml = function(self, dayData){
        var users = []
        $.each(dayData.users, function(userId, user){
            if(user.projectlogs && user.projectlogs['logs']){
                $.each(user.projectlogs.logs, function (k, log) {
                    var offset = moment.parseZone(log.start_datetime).utcOffset();
                    user.projectlogs.logs[k].start_datetime = moment(log.start_datetime).utcOffset(offset).format('HH:mm')
                    user.projectlogs.logs[k].end_datetime = moment(log.end_datetime).utcOffset(offset).format('HH:mm')
                })
                users.push(user)
            }
        })
        var html = $('#project-logs-day-template-worker').render({
            users: users,
            User: self.user,
            project: self.project,
            moment: moment
        });
        var $logs = $(html);

        $logs.find('.edit-logs-times-btn').click(function() {
            $logs.find('.update-logs-times-btn').toggle()
        })

        $logs.find('.update-logs-times-btn').click(function() {
            var $log = $(this).closest('.log-item');
            $log.find('.update-time').show()
            $log.find('.time-data').hide()
            $log.find('.save-logs-times-btn').show()
            $(this).hide()
        })

        $logs.find('.save-logs-times-btn').click(function() {
            var $log = $(this).closest('.log-item');
            $log.find('.update-time').hide()
            $log.find('.time-data').show()
            $log.find('.update-logs-times-btn').show()
            $(this).hide()
        })

        return $logs;
    }
    var initPhotoSwipeFromDOM = function(gallerySelector) {
        // parse slide data (url, title, size ...) from DOM elements
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes
                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };



                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if(!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) {
                    continue;
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
            params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                }

            };

            // PhotoSwipe opened from URL
            if(fromURL) {
                if(options.galleryPIDs) {
                    // parse real index when custom PIDs are used
                    // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                    for(var j = 0; j < items.length; j++) {
                        if(items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    // in URL indexes start from 1
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            // exit if index not found
            if( isNaN(options.index) ) {
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
        }
    }
    var createDiaryTaskRequest = function (self, data, callback) {
        $.ajax({
            url: ProjectsUrls.api.projectReportsAddTask(self.project.id),
            type: 'post',
            data: data,
            dataType: 'json',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var renderSelfMonitorTab = function(self) {
        bindSelfMonitorButtons(self);
        refreshSelfMonitorList(self, {page: 1});

        if (self.isProjectArchived){
            self.$selfmonitorbox.find('.create-sm-template').hide()
            self.$selfmonitorbox.find('.show-sm-templates').hide()
        }
    }
    var bindSelfMonitorButtons = function(self){
        if(self.last_smtemplate){
            self.$selfmonitorbox.find('.create-sm-item-last-template').show()
        }
        self.$selfmonitorbox.on('click', '.create-sm-template', function() {
            selfMonitorTemplateForm(self, {project_name: self.project.title});
        });


        var self_motitor_start_date = self.$selfmonitorbox.find('#self-motitor-start-date')
        var self_motitor_end_date   = self.$selfmonitorbox.find('#self-motitor-end-date')

        if (isMobile('any') && isDateFieldSupported()) {

            self_motitor_start_date.prop('type', 'date')
            self_motitor_start_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")

            self_motitor_end_date.prop('type', 'date')
            self_motitor_end_date.on("change", function() {
                if($(this).val().length>0){
                    $(this).addClass("full");
                }else{
                   $(this).removeClass("full");
                }
            }).trigger("change")


        }else{
            self_motitor_start_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var $box = $(this).closest('.date-filter');

                var endd = $box.find('#self-motitor-end-date').val()
                if (endd==''){
                    $box.find('#self-motitor-end-date').val(self.$selfmonitorbox.find('#self-motitor-start-date').val())
                }
            })

            self_motitor_end_date.pickadate({
                format: "yyyy-mm-dd",
                // min: [2015, 7, 14],
                container: '#pickadatecontainer',
                // editable: true,
                closeOnSelect: true,
                closeOnClear: true
            }).on('change', function(ev){
                var $box = $(this).closest('.date-filter');

                var endd = $box.find('#self-motitor-start-date').val()
                if (endd==''){
                    $box.find('#self-motitor-start-date').val(self.$selfmonitorbox.find('#self-motitor-end-date').val())
                }
            })
        }
        self.$selfmonitorbox.on('click', '.apply-filter-btn', function() {
            var $btn = $(this)
            var params = self.$selfmonitorbox.find('.date-filter').find('input').serializeArray();
            params.push({name:'page', value:1});
            refreshSelfMonitorList(self, params);
        });

        self.$selfmonitorbox.on('click', '.self-monitor-item-form .p_value', function() {
            var selector = $(this).closest('.self-monitor-item-form').find('.selector')

            var state = selector.data('state');
            if (state!=2)
                selector.click();
        })

        self.$selfmonitorbox.on('click', '.selector', function() {
            var attrState = $(this).attr('state');
            if (attrState==2){
                $(this).data('state', 2);
                $(this).attr('state',1);
            }

            var state = $(this).data('state');
            var $box = $(this).closest('.self-monitor-item').find('.self-monitor-box')
            var item = $(this).closest('.self-monitor-item').data('item')

            if($box.hasClass('unloaded')){
                retrieveSelfMonitorItemRequest(self, item, {}, function (response) {
                    renderSelfMonitorItemDetails(self, $box, response)
                })
            }

            switch(state){
                case 1 :
                case undefined :
                    $(this).find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                    $(this).parent().find('.self-monitor-box').removeClass('hide');
                    $(this).data('state', 2);
                    break;
                case 2 :
                    $(this).find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(this).parent().find('.self-monitor-box').addClass('hide');
                    $(this).data('state', 1);
                    break;
            }
        });
        self.$selfmonitorbox.on('click', '.diary-item .date, .diary-item .poject_title', function() {
            var state = $(this).closest('.diary-item').find('.selector').data('state');
            if (state!=2)
                $(this).closest('.diary-item').find('.selector').click();
        });
        self.$selfmonitorbox.on('click', '.edit-sm-item-form', function() {
            //editSelfMonitorItemForm($(this), self);
            editSelfMonitorItemFormWithData($(this), self);
        });
        self.$selfmonitorbox.on('click', '.save-sm-item-form', function() {
            var $button = $(this);
            var $item = $(this).closest('.self-monitor-item');
            var item = $item.data('item');

            var currenddatetime = moment().format('DD.MM.YYYY HH:mm');

            $item.find(".dateEditValue").val(currenddatetime);

            var $form = $item.find('.self-monitor-item-form');
            var changes = $form.formParams();
            var data = prepareSelfMonitorFormData(self, changes, item);
            //console.log(item);
            //console.log(changes);
            //console.log(data);

            updateSelfMonitorItemRequest(self, item, data, function (updatedItem) {
                $item.data('item', updatedItem);
                $button.hide();
                $item.find('.edit-sm-item-form').show();
                $item.find(".imgcheck-checkbox").each(function() {
                    $(this).addClass("hide");
                });


                $item.find( ".readonly" ).each(function() {
                    $(this).addClass("hide");
                    $(this).parent().find('.text-value').text($(this).val()).removeClass("hide");
                });
                $item.find(".imgcheck").each(function() {
                    var checked = $(this).parent().parent().find('.imgcheck-checkbox-live');
                    if (checked.is(":checked") == true){
                        $(this).removeClass("hide");
                    }else{
                        $(this).addClass("hide");
                    }
                });

                $item.find(".imgcheck-unactive").each(function() {
                    var checked = $(this).parent().parent().find('.imgcheck-checkbox-live');
                    if (checked.is(":checked") == true){
                        $(this).addClass("hide");
                    }else{
                        $(this).removeClass("hide");
                    }
                });

                $item.find(".imgcheck-border").each(function() {
                    $(this).removeClass("hide");
                });
                $item.find(".p_edit").each(function() {
                    $(this).addClass("hide");
                });
                $item.find(".p_value").each(function() {
                    var text = $(this).parent().find('.p_edit').val();
                    //console.log(text);
                    $(this).removeClass("hide").text(text);
                    if (text!=''){
                        $item.find('.date').hide();
                        $item.find('.poject_title').show();
                    }else{
                        $item.find('.date').show();

                    }

                });

            });
        });
        self.$selfmonitorbox.on('click', '.show-sm-templates', function() {
            var html = $('#self-monitor-templates').render();
            var height = parseInt(self.windowCoBaseHeight / 1.5,10);


            if (isMobile('any')) {
                let pbottom = self.windowCoBaseHeight / 2
                $('#self-monitor-templates-modal').find('.block-content').css('height',self.modalContentHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            }else{
                $('#self-monitor-templates-modal').css('overflow','auto')
                $('#self-monitor-templates-modal').find('.block-content').css('min-height','450px')
            }

            $('#self-monitor-templates-modal .block-content').html(html);


            var $box = $('.choose-templates');

            $.each(self.smtemplates, function (k, template) {
                if(template){
                    var $template = renderSelfMonitorTemplateHtml(self, template);
                    $box.find('.sm-templates-list').append($template);
                }
            });

            $('#self-monitor-templates-modal').modal('show');
        });
        self.$selfmonitorbox.on('click', '.create-sm-item-last-template', function() {
            var template = self.last_smtemplate;
            var itemData = template;
            itemData.template = template.id;

            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                var item = items[0];
                var $item = renderSelfMonitorItemHtml(self, item);
                prependSelfMonitorItemToList(self, $item);
                var editformbutton = $item.find('.edit-sm-item-form');
                editSelfMonitorItemForm(editformbutton, self);
            });
            return false;
        });

        $(document).on('click', '.checkbox1click', function() {
            var lavel = $(this).attr('branch');
            var box = $(this).parent().parent().parent().parent().parent();

            if ( $(this).is(":checked") == true ) {
                box.find('.checkbox1_lavel_'+lavel).first().show();
            } else {
                box.find('.checkbox1_lavel_'+lavel).hide();
                box.find('.checkbox1_lavel_'+lavel).find('.imgcheck-checkbox-live').removeAttr('checked');
            }
        });
        $(document).on('click', '.checkbox2click', function() {
            var lavel = $(this).attr('branch');
            var box = $(this).parent().parent().parent().parent().parent();

            if ( $(this).is(":checked") == true ) {
                box.find('.checkbox2_lavel_'+lavel).first().show();
            } else {
                box.find('.checkbox2_lavel_'+lavel).hide();
                box.find('.checkbox2_lavel_'+lavel).find('.imgcheck-checkbox-live').removeAttr('checked');
            }
        });
        $(document).on('click', '.add-one-more', function() {
            $(this).hide();
            $(this).parent().find('.additional-checkbox').removeClass('hide');
        });
        $(document).on('click', '.add-sub-field', function() {
            self.addnewsubfield($(this));
        });
        $(document).on('click', '.remove-field', function() {
            self.removefield($(this));
        });
        $(document).on('keyup', '.checkbox1_name', function() {
            //$(this).parent().find('.checkbox1').prop('checked',true);
            var text = $(this).val();
            var field_type_data = $(this).parent().parent().parent().parent().find('.field_type_data').first();
            field_type_data.find('.checkbox1_name_temp').val(text);

            //if (text == '')
            //    field_type_data.find('.checkbox1_temp').val('notchecked');
            //else
            //    field_type_data.find('.checkbox1_temp').val('checked');
        });
        $(document).on('keyup', '.checkbox2_name', function() {
            var text = $(this).val();
            var field_type_data = $(this).parent().parent().parent().parent().find('.field_type_data').first();
            field_type_data.find('.checkbox2_name_temp').val(text);
        });
        $(document).on('keyup', '.checkbox_text', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().find('.field_type_data').find('.checkbox_text_temp').val(text);
        });
        $(document).on('click', '.checkbox1', function() {
            var item = $(this).parent().parent().parent().parent();
            if ( $(this).is(":checked") == true ) {
                item.find('.field_type_data').first().find('.checkbox1_temp').val('checked');
                $(this).parent().find('.sub-field-1').show();
            } else {
                item.find('.field_type_data').first().find('.checkbox1_temp').val('notchecked');
                $(this).parent().find('.sub-field-1').hide();
                var lavel = item.attr('lavel');
                item.find('.checkbox1_lavel_'+lavel).remove();
            }
        });
        $(document).on('click', '.checkbox2', function() {
            var item = $(this).parent().parent().parent().parent();
            if ( $(this).is(":checked") == true ) {
                item.find('.field_type_data').first().find('.checkbox2_temp').val('checked');
                $(this).parent().find('.sub-field-2').show();
            } else {
                item.find('.field_type_data').first().find('.checkbox2_temp').val('notchecked');
                $(this).parent().find('.sub-field-2').hide();
                var lavel = item.attr('lavel');
                item.find('.checkbox2_lavel_'+lavel).remove();
            }
        });
        $(document).on('keyup', '.textfield', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().parent().find('.textfield_temp').val(text);
        });
        $(document).on('keyup', '.text', function() {
            var text = $(this).val();
            $(this).parent().parent().parent().parent().find('.text_temp').val(text);
        });
        $(document).on('click', '.edit-sm-template', function() {
            var $button = $(this);
            var $template = $button.closest('.self-monitor-template');
            var template = $template.data('template');
            //console.log(template);
            $('#self-monitor-templates-modal').modal('hide');
            selfMonitorTemplateForm(self, template);
        });
        $(document).on('click', '.remove-sm-template', function() {
            var $button = $(this);
            var $template = $button.closest('.self-monitor-template');
            var template = $template.data('template');


            if (confirm("Are you sure to delete template?")) {
                removeSelfMonitorTemplateRequest(self, template.urls.remove, function () {
                    removeTemplateFromArray(self, template);
                    $template.remove();

                    var itemsCount = $('.sm-templates-list').find('.self-item').length;
                    if(itemsCount==0){
                        self.$selfmonitorbox.find('.create-sm-item-last-template').hide();
                        $('#self-monitor-templates-modal').modal('hide');
                    }
                });
            }
        });
        $(document).on('click', '.save-sm-template', function() {
            var $box = $('.self-monitor-edit-template');
            var $form = $('#self-monitor-edit-template-form');
            var $button = $(this);
            $form.validator().on('submit', function (e) {
                if (e.isDefaultPrevented()) {
                // handle the invalid form...
                } else {
                    $form.find('input[type="text"]').each( function () {
                        if ($(this).val()=='') $(this).val(' ');
                    });

                    var formData = $form.formParams();
                    if (formData.action == 'add'){
                        createSelfMonitorTemplateRequest(self, {data:JSON.stringify([formData])}, function(templates){
                            var template = templates[0];
                            self.smtemplates.push(template);
                            var itemData = formData;
                            itemData.template = template.id;
                            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                                var item = items[0];
                                self.last_smtemplate = item.template;
                                var $item = renderSelfMonitorItemHtml(self, item);
                                prependSelfMonitorItemToList(self, $item);
                                $('#self-monitor-edit-modal').modal('hide');
                                var editformbutton = $item.find('.edit-sm-item-form');
                                editSelfMonitorItemForm(editformbutton, self);
                            });
                        });
                    }
                    if (formData.action == 'edit'){
                        var template = $box.data('template');
                        formData.data = JSON.stringify(formData.data);
                        updateSelfMonitorTemplateRequest(self, template.urls.update, formData, function(updated_template){
                            removeTemplateFromArray(self, template);
                            self.smtemplates.push(updated_template);
                            $('#self-monitor-edit-modal').modal('hide');
                        });
                    }
                    self.$selfmonitorbox.find('.create-sm-item-last-template').show();
              }
              return false;
            });
        });
        $(document).on('click', '.create-sm-item', function() {
            var $template = $(this);
            var template = $template.parent().data('template');
            var itemData = template;
            itemData.template = template.id;

            createSelfMonitorItemRequest(self, {data:JSON.stringify([itemData])}, function (items) {
                var item = items[0];
                self.last_smtemplate = item.template;
                var $item = renderSelfMonitorItemHtml(self, item);
                prependSelfMonitorItemToList(self, $item);
                $('#self-monitor-templates-modal').modal('hide');

                var selector = $item.find('.selector');
                var attrState = selector.attr('state');
                var $box = selector.closest('.self-monitor-item').find('.self-monitor-box')
                var itemNew = selector.closest('.self-monitor-item').data('item')

                if($box.hasClass('unloaded')){
                    retrieveSelfMonitorItemRequest(self, itemNew, {}, function (response) {
                        renderSelfMonitorItemDetails(self, $box, response)
                        var editformbutton = $item.find('.edit-sm-item-form');
                        editSelfMonitorItemForm(editformbutton, self);

                        selector.find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                        selector.data('state', 2);
                    })
                }

            });
            return false;
        });
        $(document).on('click', '.remove-sm-item', function() {
            var $button = $(this);
            var $item = $button.closest('.self-monitor-item');
            var item = $item.data('item');

            swal({
                title: gettext("Are you sure?"),
                text: gettext("You will not be able to recover this form!"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Yes, delete it!"),
                cancelButtonText: gettext("No, cancel!"),
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm){
                if (isConfirm) {
                    removeSelfMonitorItemRequest(self, item, function (item) {
                        $item.remove();
                        swal({
                            title: gettext('Deleted!'),
                            text: gettext("Form has been deleted."),
                            type: "success",
                            timer: 1500,
                            showConfirmButton: false
                        })
                    });
                } else {
                    swal(gettext("Cancelled"), gettext("Form is safe :)"), "error")
                }
            })
        });
    }
    var refreshSelfMonitorList = function(self, params){
        var $smreports = self.$selfmonitorbox.find('.self-monitor-items');

        retrieveSelfMonitorItemsRequest(self, params, function(response){
            var $items = renderSelfMonitorItemsHtml(self, response.data, response.keys);

            if ($smreports.find('.self-monitor-item').length) {
                $smreports.jsonscroll.destroy();
                $smreports.find('.jsonscroll-loading').remove();
            }
            $smreports.find('.self-monitor-item').remove()
            $smreports.find('.clear').remove()

            $smreports.append($items);
            $smreports.jsonscroll({
                nextSelector: 'a.jscroll-next:last',
                contentHandler: function(response){
                    return renderSelfMonitorItemsHtml(self, response.data, response.keys);
                }
            });
        });
    }
    var retrieveSelfMonitorItemsRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsCustomForms(self.project.id),
            data:data,
            type: 'get',
            async: false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var createSelfMonitorTemplateRequest = function(self, data, callback){
        $.ajax({
            url: CustomFormsUrls.api.templates,
            data:data,
            type: 'post',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var selfMonitorTemplateForm = function(self, data){
        var edit = typeof data.data != 'undefined'
        //console.log(edit);

        var formHtml = ''
        if (edit){
            formHtml = createSelfMonitorTemplateFromData(self, data.data);
        }
        var html = $('#self-monitor-edit-template').render({
            data: data,
            formHtml: formHtml
        });


        var height = parseInt(self.windowCoBaseHeight / 1.5,10);

        $('#self-monitor-edit-modal').html(html)

        if (isMobile('any')) {
            let newHeight = self.modalContentHeight - 70
            $('#self-monitor-edit-modal').find('.block-content').css('height',newHeight+'px').css('overflow','scroll').css('padding-bottom',pbottom+'px')
            $('#self-monitor-edit-modal').find('.block-header').css('padding-top',self.blockHeadeIOSApp+'px')
        }else{
            $('#self-monitor-edit-modal').css('overflow','auto')
        }

        $('#self-monitor-edit-modal').modal('show');

        var $box = $('#self-monitor-edit-template-form');
        if (edit){
            $box.data('template', data);
            $box.find('.save-sm-template').removeClass('hide');
            $box.find('.save-sm-template-cancel').removeClass('hide');
            $box.find('.fields').show();
            $box.find('.self-monitor-edit-action').val('edit');
        }
    }
    var renderSelfMonitorItemsHtml = function (self, items, keys) {
        var data = [];
        $.each(items, function (k, item) {
            var $item = renderSelfMonitorItemHtml(self, item, keys);
            data.push($item);
        });
        return data;
    }
    var renderSelfMonitorItemHtml = function(self, item, keys){
        var html = $('#self-monitor-item-template').render({
            item : item,
            project: self.project,
            keys: keys
        });

        var $item = $(html);
        $item.data('item', item);
        return $item;
    }
    var renderSelfMonitorItemDetails = function(self, $box, item){
        var formFieldsHtml = makeSelfMonitorFormFieldsHtml(self, item.data);
        var html = $('#self-monitor-item-details-template').render({
            formFields: formFieldsHtml,
            item : item,
            project: self.project
        });

        var $details = $(html);

        if (self.isProjectArchived){
            $details.find('.edit-sm-item-form').hide()
            $details.find('.remove-sm-item').hide()
        }

        $box.empty().append($details)
        $box.removeClass('unloaded')
        $box.closest('.self-monitor-item').data('item', item);
    }
    var renderSelfMonitorTemplateHtml = function (self, template) {
        var html = $('#self-monitor-template').render({
            template: template,
            User : self.user
        });
        var $template = $(html);
        if(this.user.id != template.owner.id){
            $template.find('.edit-sm-template').hide();
            $template.find('.remove-sm-template').hide();
        }
        $template.data('template', template);
        return $template;
    }
    var createSelfMonitorItemRequest = function(self, data, callback){
        $.ajax({
            url: ProjectsUrls.api.projectReportsCustomForms(self.project.id),
            data:data,
            type: 'post',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var editSelfMonitorItemForm = function(obj, self){
        var $button = obj;
        var $box = obj.closest('.self-monitor-item');
        $button.hide();
        $box.find('.save-sm-item-form').show();

        $box.find(".imgcheck-checkbox").each(function() {
            $(this).removeClass("hide");
            $(this).find('.imgcheck-checkbox-live').removeAttr('checked');
        });
        $box.find(".readonly, .p_edit").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".text-value, .p_value, .imgcheck-border").each(function() {
            $(this).addClass("hide");
        });
        $box.find(".imgcheck").each(function() {
            $(this).addClass( "hide" );
        });
        $box.find(".self-monitor-form-fields").each(function() {
            if ($(this).hasClass('border-top')){

            }else{
                $(this).hide();
            }
        });
    }
    var prepareSelfMonitorFormData = function(self, changes, item){
        var result = {};
        var data = item.data;

        if("checkbox1_temp" in changes){
            $.each(changes.checkbox1_temp, function (key, value) {
                if(value){
                   changes.checkbox1_temp[key] = 'checked';
                }else{
                   changes.checkbox1_temp[key] = 'notchecked';
                }
            });
        }
        if("checkbox2_temp" in changes){
            $.each(changes.checkbox2_temp, function (key, value) {
                if(value){
                   changes.checkbox2_temp[key] = 'checked';
                }else{
                   changes.checkbox2_temp[key] = 'notchecked';
                }
            });
        }
        $.each(changes, function (k, v) {
           if(k == 'name' || k == 'project_name' || k == 'company_name'){
               result[k] = v;
           }else{
               data[k] = v;
           }
        });
        result['data'] = JSON.stringify(data);

        return result;
    }
    var prependSelfMonitorItemToList = function(self, $item){
        $item.find('.selector').attr('state', 2);
        $item.find('.selector').find('img').attr('src','/static/img/down.svg');
        $item.find('.self-monitor-item-content').removeClass('hide');
        var $box = self.$selfmonitorbox.find('.self-monitor-items');

        var $jsoncrollBox = $box.find('.jsonscroll-inner');
        if($jsoncrollBox.length){
            $jsoncrollBox.find('.date-filter').after($item);
        }else{
            $box.find('.date-filter').after($item);
        }

    }
    var makeSelfMonitorFormFieldsHtml = function(self, data){
        //console.log(data);
        var fields = '';
        var htmltemp = '';
        var objecthtmltemp = {};
        var date_edit = '';
        var projectUsers = self.project.getUsersObject()
        var userinfo

        if (typeof data.date_edit != 'undefined')
            date_edit = data.date_edit;

        if( typeof data.field_type == 'string'){
            var renderData = {};
            renderData.index = 0;
            renderData.branch = data.branch;
            renderData.parent_branch = data.parent_branch;
            renderData.field_type = data.field_type;
            renderData.checkbox_text = data.checkbox_text_temp;
            renderData.checkbox1_name = data.checkbox1_name_temp;
            renderData.checkbox2_name = data.checkbox2_name_temp;

            if (typeof data.checkbox1_temp == 'object')
                renderData.checkbox1 = data.checkbox1_temp[0];
            else if (data.checkbox1_temp=='n')
                renderData.checkbox1 ='notchecked';
            else
                renderData.checkbox1 = data.checkbox1_temp;

            if (typeof data.checkbox2_temp == 'object')
                renderData.checkbox2 = data.checkbox2_temp[0];
            else if (data.checkbox2_temp == 'n')
                renderData.checkbox2 = 'notchecked';
            else
                renderData.checkbox2 = data.checkbox2_temp;


            if (typeof data.checkbox1_user_id != 'undefined'){
                renderData.checkbox1_user_id = data.checkbox1_user_id[0];
                if(renderData.checkbox1_user_id>0){
                    userinfo = projectUsers[renderData.checkbox1_user_id];
                    renderData.checkbox1_user_name = userinfo.user.name;
                }
            }
            if (typeof data.checkbox2_user_id != 'undefined'){
                renderData.checkbox2_user_id = data.checkbox2_user_id[0];
                if(renderData.checkbox2_user_id>0){
                    userinfo = projectUsers[renderData.checkbox2_user_id];
                    renderData.checkbox2_user_name = userinfo.user.name;
                }
            }


            renderData.textfield = data.textfield_temp;
            renderData.text = data.text_temp;
            renderData.active_checkbox = data.active_checkbox;
            renderData.show_item_by_checkbox = data.show_item_by_checkbox;

            if (typeof data.checkbox1_temp_edit_date != 'undefined')
                renderData.checkbox1_temp_edit_date = data.checkbox1_temp_edit_date[0];
            if (typeof data.checkbox2_temp_edit_date != 'undefined')
                renderData.checkbox2_temp_edit_date = data.checkbox2_temp_edit_date[0];
            if (typeof data.textfield_value_temp != 'undefined')
                renderData.textfield_value = data.textfield_value_temp;
            if (typeof data.text_value_temp != 'undefined')
                renderData.text_value = data.text_value_temp;
            //console.log(renderData);
            var itemHtml = $('#self-monitor-form-fields-template').render({data: renderData, date_edit: date_edit});
            fields = fields + itemHtml;
        }else{
            $(data.field_type).each(function(index, field_type){
                var renderData = {};
                renderData.index = index;
                renderData.branch = data.branch[index];
                renderData.parent_branch = data.parent_branch[index];
                renderData.field_type = field_type;
                renderData.checkbox_text = data.checkbox_text_temp[index];
                renderData.checkbox1_name = data.checkbox1_name_temp[index];
                renderData.checkbox1 = data.checkbox1_temp[index];
                renderData.checkbox2_name = data.checkbox2_name_temp[index];
                renderData.checkbox2 = data.checkbox2_temp[index];
                renderData.textfield = data.textfield_temp[index];
                renderData.text = data.text_temp[index];
                renderData.active_checkbox = data.active_checkbox[index];
                if (typeof data.checkbox1_temp_edit_date != 'undefined')
                    renderData.checkbox1_temp_edit_date = data.checkbox1_temp_edit_date[index];
                if (typeof data.checkbox2_temp_edit_date != 'undefined')
                    renderData.checkbox2_temp_edit_date = data.checkbox2_temp_edit_date[index];

                if (renderData.branch==3){
                    var active_checkbox_additional = renderData.active_checkbox.slice(0, -1);
                    var parent_parent_branch = renderData.parent_branch - 1;
                    renderData.active_checkbox = renderData.active_checkbox+' '+active_checkbox_additional+parent_parent_branch;
                }

                renderData.show_item_by_checkbox = data.show_item_by_checkbox[index];


                if (typeof data.textfield_value_temp != 'undefined')
                    renderData.textfield_value = data.textfield_value_temp[index];
                if (typeof data.text_value_temp != 'undefined')
                    renderData.text_value = data.text_value_temp[index];

                if (typeof data.checkbox1_user_id != 'undefined'){
                    renderData.checkbox1_user_id = data.checkbox1_user_id[index];
                    if(renderData.checkbox1_user_id>0){
                        userinfo = projectUsers[renderData.checkbox1_user_id];
                        renderData.checkbox1_user_name = userinfo.user.name;
                    }
                }
                if (typeof data.checkbox2_user_id != 'undefined'){
                    renderData.checkbox2_user_id = data.checkbox2_user_id[index];
                    if(renderData.checkbox2_user_id>0){
                        userinfo = projectUsers[renderData.checkbox2_user_id];
                        renderData.checkbox2_user_name = userinfo.user.name;
                    }
                }


                //console.log(renderData);

                var itemHtml = $('#self-monitor-form-fields-template').render({data: renderData, date_edit: date_edit});

                if (renderData.parent_branch == 0){
                    objecthtmltemp = $('<div class="main-item-box">'+itemHtml+'</div>');
                    if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] ==0 ){
                        fields = fields + objecthtmltemp[0].outerHTML;
                    }
                }else{
                    objecthtmltemp.append(itemHtml);
                    if (typeof data.parent_branch[index+1]=='undefined' || data.parent_branch[index+1] ==0 ){
                        fields = fields + objecthtmltemp[0].outerHTML;
                    }
                }
            });

        }
        var html = '<div>'+fields+'</div>'
        var object = $('<div/>').html(html).contents();



        var mainbox = object.find('.main-item-box');
        $.each(mainbox, function () {
            var mainboxobject = $(this);

            var checkbox1click = mainboxobject.find('.checkbox1click');
            $.each(checkbox1click, function () {
                if ( $(this).is(":checked") == true ) {
                } else {
                    var lavel = $(this).attr('branch');
                    mainboxobject.find('.checkbox1_lavel_'+lavel).hide();
                }
            });

            var checkbox2click = mainboxobject.find('.checkbox2click');
            $.each(checkbox2click, function () {
                if ( $(this).is(":checked") == true ) {
                } else {
                    var lavel = $(this).attr('branch');
                    mainboxobject.find('.checkbox2_lavel_'+lavel).hide();
                }
            });
        });



        return object.html() + '<div class="border-bottom"></div>';
    }
    var updateSelfMonitorItemRequest = function (self, item, data, callback) {
        $.ajax({
            url: CustomFormsUrls.api.item(item.id),
            type: 'put',
            data:data,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var retrieveSelfMonitorItemRequest = function(self, item, data, callback){
        $.ajax({
            url: CustomFormsUrls.api.item(item.id),
            data:data,
            type: 'get',
            async: false,
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var removeSelfMonitorItemRequest = function (self, item, callback) {
        $.ajax({
            url: CustomFormsUrls.api.item(item.id)+'?'+ $.param({'jssid': '1234'}),
            type: 'delete',
            success: function (response) {
                if (typeof callback == 'function') {
                    callback(response)
                }
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }
    var editSelfMonitorItemFormWithData = function(obj, self){
        var $button = obj;
        var $box = obj.closest('.self-monitor-item');
        $button.hide();
        $box.find('.save-sm-item-form').show();


        $box.find(".date").hide();

        $box.find(".imgcheck-checkbox").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".readonly, .p_edit").each(function() {
            $(this).removeClass("hide");
        });
        $box.find(".text-value, .p_value, .imgcheck-border").each(function() {
            $(this).addClass("hide");
        });
        $box.find(".imgcheck").each(function() {
            $(this).addClass( "hide" );
        });
        $box.find(".self-monitor-form-fields").each(function() {
            if ($(this).hasClass('border-top')){

            }else{
                //$(this).hide();
            }
        });
    }
    var retrieveSelfMonitorTemplates = function(self){
        var ownerids = []
        for(let companyUser of self.user['companyusers']){
            if(companyUser.user_id){
                ownerids.push(companyUser.user_id)
            }
        }
        ownerids = ownerids.join(',')
        $.ajax({
            url: CustomFormsUrls.api.templates,
            data:{ownerids:ownerids},
            type: 'get',
            async: false,
            success: function (response) {
                self.smtemplates = response
            },
            error: function (xhr, status, errors) {
                //console.log(self, $.parseJSON(xhr.responseText));
            }
        });
    }

    ProjectReportsForWorker = createClass({
        construct : function(options) {
            this.modalContentHeight = options.modalContentHeight
            this.windowCoBaseHeight = options.windowCoBaseHeight
            this.NewDesignCoBaseSetHeight = options.NewDesignCoBaseSetHeight
            this.blockHeadeIOSApp = options.blockHeadeIOSApp
            this.$box = $(options.box);
            this.$diarybox = this.$box.find('.diary-box');
            this.$selfmonitorbox = this.$box.find('.self-monitor-box');
            this.user = options.user
            this.project = options.project
            this.isProjectArchived = this.project.statusForUser(this.user.id) == 'archived'
            this.isProjectActive = this.project.statusForUser(this.user.id) == 'active'
            this.urls = options.urls;
            this.smtemplates = [];
            this.uploadconf = {
                accept_file_types: /(\.|\/)(jpe?g|png)$/i,
                accept_file_extensions: /(\.jpg|\.jpeg|\.png)$/i,
                max_file_size: '50MB'
            };
        },
        run : function() {
            if (isMobile('any') && isTimeFieldSupported()) {
                var duration_finished = $('.duration_finished')
                duration_finished.removeAttr('readonly').prop('type', 'time')
            }else{
                $("#dtBox").DateTimePicker({
                    addEventHandlers: function(){
                        var dtPickerObj = this;
                        $(document).on('click','#id-duration',function(e){
                            e.stopPropagation();
                            dtPickerObj.showDateTimePicker($("#id-duration"));
                        })
                    }
                })
            }

            this.setHeight(this.$box);
            this.bindTabs();

            var tab = getUrlHash();
            if(!tab || !tab.length){
                tab = 'diary-box';
            }
            this.showTab(tab);
            retrieveSelfMonitorTemplates(self)
        },
        showTab: function(tab){
            var self = this;
            var $tab=self.$box.find('a[data-id='+tab+']');
            if($tab.length){
                $tab.click();
            }
        },
        bindTabs: function() {
            var self = this
            self.$box.find('.tab').click(function () {
                self.$box.find('.tab').parent().removeClass('active');
                self.$box.find('.content').hide();
                var $tab = $(this);
                $tab.parent().addClass('active');
                var id = $tab.data('id');
                var $box = self.$box.find('.'+id);
                $box.show();
                if($box.hasClass('loading')){
                    $box.removeClass('loading');
                    if(id=='diary-box'){
                        renderDiaryTab(self);
                    }else if(id == 'self-monitor-box'){
                        renderSelfMonitorTab(self);
                    }
                }

                location.href='#'+id;
            });
        },
        setHeight : function($box) {
            var self = this;
            var tabsHeight = 47;
            var height = this.windowCoBaseHeight - this.NewDesignCoBaseSetHeight - tabsHeight;
            $box.find('.diary-list, .self-monitor-list').css('height',height+'px');
            $(window).resize(function () {
                var height = self.windowCoBaseHeight - self.NewDesignCoBaseSetHeight - tabsHeight;
                $box.find('.diary-list, .self-monitor-list').css('height',height+'px');
            })
        },
        setUpdateDateForCheckbox: function(obj){
            var currenddatetime = moment().format('DD.MM.YYYY HH:mm');
            obj.parent().parent().find('.checkbox1_temp_edit_date, .checkbox2_temp_edit_date').val(currenddatetime);
            obj.parent().parent().find('.dateEdit').text(currenddatetime);

            var name = this.user.name;
            var user_id = this.user.id;
            obj.parent().parent().find('.userName').text(name);
            obj.parent().parent().find('.checkbox1_user_id, .checkbox2_user_id').val(user_id);
        }
    });
})();

module.exports = {
    ProjectReportsForManager: ProjectReportsForManager,
    ProjectReportsForWorker: ProjectReportsForWorker
}