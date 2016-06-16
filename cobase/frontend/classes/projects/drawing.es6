import {ProjectsUrls} from 'constants/Urls.es6'
import {PUTRequest, POSTRequest, GETRequest, DELETERequest} from 'utils/api.es6'
import {isMobile} from 'utils/environment.es6'
import {toggleProjectDrawingRightPanel, selectActiveProjectImageTask, startUpdateActiveProjectImage, finishUpdateActiveProjectImage, changeProjectDrawingActiveTab, changeActiveProjectTaskDetailsViewMode, activeProjectTaskUpdated, activeProjectTaskDetailsUpdated} from 'actions/projects.es6'
import {modal} from 'react-redux-modal'
import ProjectTaskModalContainer from 'containers/projects/ProjectTaskModalContainer.jsx'
import {changeLocation} from 'actions/site.es6'
import {ProjectTask} from 'classes/projects/common.es6'
import {bytesToSize} from 'utils/file.es6'
import {guid} from 'utils/string.es6'

export class ProjectDrawingMapManager {
    constructor(options){
        this.user = options.user
        this.image = options.image
        this.tasks = {}
        this.project = options.project
        this.defaultTaskTitle = gettext('New Task')
        this.dispatch = options.dispatch
        this.fitBoundsMapMaxZoom = 2
        this.isUpdating = false
        this.greenIcon = L.icon({
            iconUrl: '/static/img/task_pin_blue.png',
            iconSize: [27, 44],
            iconAnchor: [13, 44],
            popupAnchor: [1, -40]
        });
        this.redIcon = L.icon({
            iconUrl: '/static/img/task_pin_red.png',
            iconSize: [27, 44],
            iconAnchor: [13, 44],
            popupAnchor: [1, -40]
        });
    }

    selectMapObject(id, fitBounds=false) {
        var self = this

        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                if (map._layers[ml].options.id == id) {
                    if (map._layers[ml].options.weight == 1) { // rectangle
                        map._layers[ml].setStyle({fillOpacity: 0.2})
                        if (fitBounds){
                            var bounds = map._layers[ml].getBounds()
                            var newBounds = bounds
                            if (!isMobile('any'))
                                newBounds._southWest.lng = newBounds._southWest.lng + 100

                            let maxZoom = self.fitBoundsMapMaxZoom
                            map.fitBounds(newBounds, {maxZoom: maxZoom})
                        }
                    } else { // marker
                        this.setIcon(self.redIcon) // set on a map red icon
                        if (fitBounds){
                            var group = new L.featureGroup([map._layers[ml]])
                            var newBounds = group.getBounds()
                            if (!isMobile('any'))
                                newBounds._southWest.lng = newBounds._southWest.lng + 100

                            let maxZoom = self.fitBoundsMapMaxZoom
                            map.fitBounds(newBounds, {maxZoom: maxZoom})
                        }
                    }
                } else if (map._layers[ml].options.id) {
                    //check type of marker
                    if (map._layers[ml].options.weight == 1) { // rectangle
                        map._layers[ml].setStyle({fillOpacity: 0})
                    } else { // marker
                        this.setIcon(self.greenIcon)
                    }
                }
            }
        })

        self.dispatch(selectActiveProjectImageTask(id))
    }

    onMapObjectClick(id, openTab=true){
        if(openTab){
            this.dispatch(changeProjectDrawingActiveTab('drawing-tasks-tab'))
        }

        if(isMobile('any')){
            this.selectMapObject(id)
            changeLocation(this.dispatch, `${ProjectsUrls.projectTask(this.project.guid, id)}`)
        }else{
            if(!this.isUpdating){
                toggleProjectDrawingRightPanel(this.dispatch, true)
                setTimeout(() => {
                    this.selectMapObject(id)
                }, 300)
            }
        }
    }

    makeTaskMapObjectsDrageble(){
        var self = this

        this.dispatch(startUpdateActiveProjectImage())
        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                var taskId = map._layers[ml].options.id
                var task = self.tasks[taskId]

                if (task) {
                    if (map._layers[ml].options.weight == 1) { // rectangle
                        if (task.owner_id != self.user.id){
                            setTimeout(function () {
                                map._layers[ml].editing.disable()
                                console.log('disable editing')
                            }, 100)
                        }
                    } else { // marker
                        if (task.owner_id == self.user.id){
                            map._layers[ml].dragging.enable()
                            map._layers[ml]
                                // #TODO: remove when leaflet finally fixes their draggable so it's touch friendly again.
                                .on('touchmove', this._onTouchMove, this)
                                .on('touchend', this._onMarkerDragEnd, this)
                        }
                    }
                }
            }
        })
    }

    makeTaskMapObjectsUndrageble() {
        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                if (map._layers[ml].options.id) {
                    //check type of marker
                    if (map._layers[ml].options.weight == 1) { // rectangle
                    } else { // marker
                        map._layers[ml].dragging.disable()
                    }
                }
            }
        })
        this.dispatch(finishUpdateActiveProjectImage())
    }

    createMarkerByCoords(xy, id) {
        var self = this
        var marker = L.marker(xy, {
            id: id,
            icon: self.greenIcon
            //draggable: editable
        })
        drawnItems.addLayer(marker)

        //marker.on('click', function (event) {
        //    self.onMapTaskObjectClick(marker)
        //})
    }

    createMarker(marker) {
        var self = this

        var position = marker.getLatLng()
        var data = {
            title: self.defaultTaskTitle,
            description: '',
            coordinates: JSON.stringify({type:'point', value:[position.lat, position.lng]}),
            view_type:'marker',
            image: self.image ? self.image.id : '',
            rtype: 'drawing',
            jssid: '1234'
        }

        this.makeTaskMapObjectsUndrageble()
        POSTRequest(ProjectsUrls.api.projectTasks(this.project.id), data, function (task) {
            self.dispatch(selectActiveProjectImageTask(task.guid))
            self.showTaskForm(task.guid)
        })
    }

    createRectangleByCoords(coordinates, id) {
        var self = this
        // define rectangle geographical bounds create an orange rectangle
        var rectangle = L.rectangle(coordinates, {id:id})
        //map.addLayer(rectangle)
        rectangle.setStyle(L.Draw.Rectangle.prototype.options.shapeOptions)

        drawnItems.addLayer(rectangle)
        rectangle._container.setAttribute('onclick','if (typeof(dmangr)!="undefined") { dmangr.onMapObjectClick("'+id+'") }')

        //rectangle.editing.enable()
        //rectangle.on('click', function (event) {
        //    self.onMapTaskObjectClick(rectangle)
        //})
    }

    createRectangle(rectangle) {
        var self = this
        var bounds = rectangle.getBounds()
        var coordinates = [[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]

        var data = {
            title: self.defaultTaskTitle,
            description: '',
            coordinates: JSON.stringify({type:'multipoint', value:coordinates}),
            view_type:'rectangle',
            image: self.image ? self.image.id : '',
            rtype: 'drawing',
            jssid: '1234'
        }

        this.makeTaskMapObjectsUndrageble()
        POSTRequest(ProjectsUrls.api.projectTasks(this.project.id), data, function (task) {
            self.dispatch(selectActiveProjectImageTask(task.guid))
            self.showTaskForm(task.guid)
        })
    }

    showTaskForm(taskGuid){
        var project = this.project

        this.dispatch(changeActiveProjectTaskDetailsViewMode('form'))
        if(isMobile('any')){
            changeLocation(this.dispatch, `${ProjectsUrls.projectTask(project.guid, taskGuid)}`)
        }else{
            this.showTaskFormInModal(taskGuid)
        }
    }

    showTaskFormInModal(taskGuid){
        var project = this.project

        modal.add(ProjectTaskModalContainer, {
            title: gettext('Task'),
            size: ('large'), // large, medium or small,
            data:{
                taskGuid: taskGuid,
                project: project,
            },
            closeOnOutsideClick: false
        });
    }

    refreshMapObjectPosition(task){
        //need to refresh task on map
        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                if (map._layers[ml].options.id == task.guid) {
                    if (map._layers[ml].options.weight == 1) { // rectangle
                        map._layers[ml].setBounds(task.coordinates);
                    } else { // marker
                        map._layers[ml].setLatLng(new L.LatLng(task.coordinates[0], task.coordinates[1]));
                    }
                }
            }
        });
    }

    getLayer(guid) {
        var layer = ''
        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                if (map._layers[ml].options.id == guid) {
                    layer = map._layers[ml]
                }
            }
        })
        return layer
    }

    mapObjectExists(task) {
        for(let key of Object.keys(map._layers)){
            var layer = map._layers[key]
            if(layer.options && layer.options.id == task.guid){
                return true
            }
        }
        return false
    }

    refreshMapObject(task, selected=false){
        if(!this.mapObjectExists(task)){
            if(task.view_type == 'marker'){
                this.createMarkerByCoords(task.coordinates, task.guid)
            }else if(task.view_type == 'rectangle'){
                this.createRectangleByCoords(task.coordinates, task.guid)
            }
        }else{
            this.refreshMapObjectPosition(task)
        }
        if(selected){
            this.selectMapObject(task.guid)
        }
    }

    refreshMapObjects(items, selected){
        for(let item of items){
            var task = this.tasks[item]
            if(task){
                this.refreshMapObject(task, selected == task.guid)
            }
        }

        $.each(map._layers, function (ml) {
            if (typeof (map._layers[ml].options) != 'undefined') {
                var id = map._layers[ml].options.id
                if(id && items.indexOf(id) == -1){
                    map.removeLayer(map._layers[ml])
                }
            }
        })
    }

    removeMap(){
        map.remove()
        window.map = null
    }

    initMap(){
        var self = this
        var image = self.image
        var project = self.project
        var user = self.user
        var isProjectActive = project.isActiveForUser(user.id)
        var tileUrl = image.map.tiles_dir_url;
        var imageWidth = image.map.width;
        var imageHeight = image.map.height;

        if (imageWidth == 'None') imageWidth = '750';
        if (imageHeight == 'None') imageHeight = '400';

        window.map = L.map('map', {
            crs: L.CRS.Simple,
            center: [0,0],
            tileSize: image.map.tile_size
        }).setView(new L.LatLng(0, 0), 0);

        L.tileLayer.zoomify(tileUrl, {
            width: imageWidth,
            height: imageHeight,
            tileSize: image.map.tile_size
        }).addTo(map);

        window.southWest = map.unproject([0, imageHeight], map.getMaxZoom());
        window.northEast = map.unproject([imageWidth, 0], map.getMaxZoom());
        window.drawnItems = L.featureGroup().addTo(map);

        map.setZoom(2);

        if(isProjectActive){
            map.addControl(new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    remove: false
                },
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    marker: true,
                    rectangle: true
                }
            }));

            map.on('draw:created', function (e) {
            var type = e.layerType, layer = e.layer;
            if (type === 'marker') {
                self.createMarker(layer);
            }
            if (type === 'rectangle') {
                self.createRectangle(layer);
            }
        });
            map.on('draw:edited', function (e) {
            var objects = [];
            var layers = map._layers;

            $.each(map._layers, function (ml) {
                if (typeof (map._layers[ml].options) != 'undefined') {
                    if (map._layers[ml].options.id) {
                        //do whatever you want, most likely save back to db
                        if (map._layers[ml].options.weight == 1) { // rectangle
                            var bounds = map._layers[ml].getBounds();
                            objects.push({
                                id: map._layers[ml].options.id,
                                type: 'rectangle',
                                bounds: [[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]
                            });
                        } else { // marker
                            var position = map._layers[ml].getLatLng();
                            objects.push({
                                id: map._layers[ml].options.id,
                                type: 'marker',
                                bounds: [position.lat, position.lng]
                            });
                        }
                    }
                }
            });
            self.makeTaskMapObjectsUndrageble()
            self.updateMapObjects(objects);
        });
        }
    }

    updateMapObjects(mapObjects) {
        var self = this
        var params ={}
        var items = []

        for(let mapObj of mapObjects){
            var task = self.tasks[mapObj.id]

            if(task && task.owner_id == self.user.id){
                var item = {'id': task.id}
                if(task.view_type == 'marker'){
                    item['coordinates'] = {type:'point', value: mapObj.bounds}
                }else if(task.view_type == 'rectangle'){
                    item['coordinates'] = {type:'multipoint', value: mapObj.bounds}
                }
                items.push(item)
            }
        }
        params['rtype'] = 'drawing'
        params['data'] = JSON.stringify(items)

        if(items.length){
            PUTRequest(ProjectsUrls.api.projectTasks(self.project.id), params)
        }
    }
}

export class ProjectTaskMapObjectManager{
    constructor(options){
        this.afterUpdate = options.afterUpdate
        this.task = options.task
        this.user = options.user
        this.image = options.image
        this.project = options.project
        this.dispatch = options.dispatch
        this.mode = options.mode
        this.fitBoundsMapMaxZoom = 2
        this.greenIcon = L.icon({
            iconUrl: '/static/img/task_pin_blue.png',
            iconSize: [27, 44],
            iconAnchor: [13, 44],
            popupAnchor: [1, -40]
        });
    }

    initMap(){
        var self = this
        var image = self.image

        var tileUrl = image.map.tiles_dir_url;
        var imageWidth = image.map.width;
        var imageHeight = image.map.height;

        if (imageWidth == 'None') imageWidth = '750';
        if (imageHeight == 'None') imageHeight = '400';

        window.ptmoMap = L.map('ptmo-map', {
            crs: L.CRS.Simple,
            center: [0,0],
            tileSize: image.map.tile_size
        }).setView(new L.LatLng(0, 0), 0);

        L.tileLayer.zoomify(tileUrl, {
            width: imageWidth,
            height: imageHeight,
            tileSize: image.map.tile_size
        }).addTo(ptmoMap);
        ptmoMap.setZoom(2);

        window.ptmoDrawnItems = L.featureGroup().addTo(ptmoMap);
        ptmoMap.addControl(new L.Control.Draw({
            edit: {
                featureGroup: ptmoDrawnItems,
                remove: false,
                edit: false
            },
            draw: {
                polyline: false,
                polygon: false,
                circle: false,
                marker: false,
                rectangle: false
            }
        }));
    }

    removeMap(){
        ptmoMap.remove()
        window.ptmoMap = null
    }

    createTaskMapObject(){
        if(this.task.view_type == 'marker'){
            this.createMarkerByCoords(this.task.coordinates, this.task.guid);
        }else if(this.task.view_type == 'rectangle'){
            this.makeRectangle(this.task.coordinates, this.task.guid);
        }
    }

    createMarkerByCoords(xy, id){
        var self = this
        var marker = L.marker(xy, {
            id: id,
            icon: self.greenIcon
            //draggable: 'editable'
        })
        ptmoDrawnItems.addLayer(marker)
        var group = new L.featureGroup([marker])

        let maxZoom = self.fitBoundsMapMaxZoom
        ptmoMap.fitBounds(group.getBounds(),{ maxZoom: maxZoom})

        if(self.task.isEditableForUser(self.user.id) && self.mode == 'edit'){
            var popupoContent = '<button class="btn btn-primary btn-xs ptmo-save-task-btn" type="button">'+gettext('Save')+'</button>'
            marker.bindPopup(popupoContent).openPopup()
            marker.dragging.enable()

            marker
            .on('touchmove', this._onTouchMove, this)
            .on('touchend', this._onMarkerDragEnd, this)

            marker.on('dragend', function(event){
                var marker = event.target
                marker.unbindPopup().closePopup()
                marker.bindPopup(popupoContent)
                setTimeout(function () { marker.openPopup(); }, 500);
            })
        }


    }

    makeRectangle(coordinates, id) {
            var self = this
            // define rectangle geographical bounds create an orange rectangle
            var rectangle = L.rectangle(coordinates, {id:id})
            //map.addLayer(rectangle);
            rectangle.setStyle(L.Draw.Rectangle.prototype.options.shapeOptions)
            ptmoDrawnItems.addLayer(rectangle)

            var bounds = rectangle.getBounds()

            let maxZoom = self.fitBoundsMapMaxZoom
            ptmoMap.fitBounds(bounds,{ maxZoom: maxZoom})

            if(self.task.isEditableForUser(self.user.id) && self.mode == 'edit'){
                var popupoContent = '<button class="btn btn-primary ptmo-save-task-btn btn-xs" type="button">'+gettext('Save')+'</button>'
                rectangle.bindPopup(popupoContent).openPopup()
                rectangle.editing.enable()

                rectangle.on('dragend', function(event){
                    var rectangle = event.target
                    rectangle.unbindPopup().closePopup()
                    rectangle.bindPopup(popupoContent)
                    setTimeout(function () { rectangle.openPopup() }, 500)
                })
            }
    }

    bindButtons(){
        var self = this
        $('#ptmo-map').on('click', '.ptmo-save-task-btn', function(){
            var params = {}
            $.each(ptmoMap._layers, function (ml) {
                if (typeof (ptmoMap._layers[ml].options) != 'undefined') {
                    if (ptmoMap._layers[ml].options.id == self.task.guid) {
                        var item = {'id': self.task.id}
                        if (ptmoMap._layers[ml].options.weight == 1) { // rectangle
                            var bounds = ptmoMap._layers[ml].getBounds()
                            var coordinates = [[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]]
                            item['coordinates'] = { type:'multipoint', value: coordinates }
                        } else { // marker
                            var position = ptmoMap._layers[ml].getLatLng()
                            item['coordinates'] = { type:'point', value: [position.lat, position.lng] }
                        }
                        params['data'] = JSON.stringify([item])
                        params['rtype'] = 'details'
                    }
                }
            })

            if(params['data'] && self.task.isEditableForUser(self.user.id)){
                PUTRequest(ProjectsUrls.api.projectTasks(self.project.id), params, function(tasks){
                    var updatedTask = new ProjectTask(tasks[0])
                    self.afterUpdate(updatedTask)
                })
            }
        })
    }

    onMapObjectClick(id){

    }
}

export class ProjectImageUploadManager{
    constructor(options) {
        this.$box = $(options.box)
        this.$addfolder = this.$box.find('.create-folder')
        this.project = options.project
        this.user = options.user
        this.uploadconf = options.uploadconf
        this.renderedFiles = {}
    }

    run(){
        var self = this
        self.bindButtons()
        self.renderProjectFolders()
    }

    bindButtons(){
        var self = this
        this.$addfolder.find('form').validator().on('submit', (e)=>{
            if (e.isDefaultPrevented()) {
                return false
            }
            var data = this.$addfolder.find('form').serialize()
            POSTRequest(ProjectsUrls.api.addProjectFolder(this.project.id), data, (folder) => {
                var $folder = this.renderProjectFolderHtml(folder)
                this.$box.find('.folders').find('thead').after($folder)
                $folder.find('.upload-files-btn').show()
                $folder.find('.files').removeClass('unloaded').show()
                this.$addfolder.find('.id_title').val('')
            })
            return false
        })
        this.$addfolder.find('.id_title').data('remote', ProjectsUrls.api.addProjectFolder(this.project.id))
        this.$box.on('click', '.file-ready-link', function () {
            var $file = $(this).closest('.project-file')
            var file = $file.data('file')
            changeLocation(self.dispatch, ProjectsUrls.projectDrawing(self.project.guid, file.guid))
            return false
        })
    }

    renderProjectFolders() {
        var self = this
        var url = `${ProjectsUrls.api.projectFolders(this.project.id)}?type=crud`
        GETRequest(url, null, (folders) => {
            for(let folder of folders){
                var $folder = this.renderProjectFolderHtml(folder)
                this.$box.find('.folders').append($folder)
            }
        })
    }

    renderProjectFileHtml(file) {
        var self = this
        var $file = $($('#project-file-template').render({
            file:file
        }))
        $file.find('.file-size').text(bytesToSize(file.size))

        if (!isMobile('any')) {
            $file.find('.btn').addClass('btn-sm')
        }
        //file from server
        if (file.id) {
            this.bindFileButtons($file)
        } else {
            //uploading file
            //var name = self.shortTitle(file.name)
            var name = file.name
            $file.find('.file-name').text(name)
        }

        this.refreshFile($file, file)
        if(file.type == 'file' && (file.status == 'ready' || file.status == 'converted')){
            $file.hide()
        }

        self.renderedFiles[file.jsguid] = file

        return $file
    }

    bindFileButtons($file) {
        var self = this
        $file
            .find('.remove-file-btn')
            .show()
            .click(function(event){

               var $file = $(this).closest('.project-file')
               var file = $file.data('file')
               var url = file.type == 'image'
                    ? ProjectsUrls.api.projectImage(self.project.id, file.id)
                    : ProjectsUrls.api.projectFile(self.project.id, file.id)

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
                        DELETERequest(url, function (response) {
                            $file.remove()
                            swal({
                                title: gettext('Deleted!'),
                                text: gettext("Your imaginary file has been deleted."),
                                type: "success",
                                timer: 1500,
                                showConfirmButton: false
                            })
                        })
                    } else {
                        swal(gettext("Cancelled"), gettext("Your imaginary file is safe :)"), "error")
                    }
                })
                return false
            })
        $file.find('.show-file-form-btn').click(function () {
            var $file = $(this).closest('.project-file')
            var file = $file.data('file')
            $file.find('.file-title').hide()
            $file.find('.edit-file-name').val(file.name)
            $file.find('.edit-file-form').show()
        })
        $file.find('.update-file-btn').click(function () {
            var $file = $(this).closest('.project-file')
            var file = $file.data('file')
            var url = file.type == 'image'
                ? ProjectsUrls.api.projectImage(self.project.id, file.id)
                : ProjectsUrls.api.projectFile(self.project.id, file.id)

            var data = $file.find('.edit-file-form').serialize()
            PUTRequest(url, data, function(file){
                $file.data('file', file)
                //var name = self.shortTitle(file.name)
                var name = file.name
                $file.find('.file-title').text(name).show()
                $file.find('.edit-file-form').hide()
            })
        })
    }

    refreshFile($file, file) {
        var self = this;

        $file.data('file', file)

        if(!file.id){
            return
        }
        var fileName = file.name
        //fileName = fileName.substr(0, fileName.lastIndexOf('.')).toLowerCase()
        $file.find('.file-name').text(fileName)
        if(file.active && file.status =='ready'){
            $file.find('.file-link').addClass('file-ready-link').css('opacity', '0.4')
        }

        var fileClass = `project-${file.type}-${file.id}`
        if(!$file.hasClass(fileClass)){
            $file.addClass(fileClass)
        }
        if(file.parent_file_id){
            var fileChildClass = `project-child-item-${file.parent_file_id}`
            if(!$file.hasClass(fileChildClass)){
                $file.addClass(fileChildClass)
            }
        }

        var $fileStatus = $file.find('.file-status')

        var fileStatuses = ['pending', 'handling', 'converting', 'ready', 'converted', 'converting error', 'error', 'preparing']
        var fileLabels = ['warning', 'danger', 'success']
        for(let status of fileStatuses){
            $fileStatus.removeClass('status-'+status)
        }
        for(let label of fileLabels){
            $fileStatus.removeClass('label-'+label)
        }

        $fileStatus.addClass('status-'+file.status)

        if(file.status == 'converting error' || file.status == 'error'){
            $fileStatus.addClass('label-danger')
        }else if((file.status == 'ready' || file.status == 'converted') && file.active){
            $fileStatus.addClass('label-success')
        }else{
            $fileStatus.addClass('label-warning')
        }

        if (file.status =='handling' || file.status =='converting') {
            $fileStatus.html(gettext('loading'))
        }else if(file.status =='preparing'){
            $fileStatus.html(gettext('pending'))
        }else if(file.status =='converting error') {
            $fileStatus.html(gettext('error'))
        }else if(file.status =='ready' && !file.active){
            $fileStatus.html(gettext('upgrade plan'))
        }else{
            $fileStatus.html(file.status_message)
        }

        if (file.type == 'image') {
            if(file.status == 'ready'){
                if(file.active){
                    $file.find('.file-link').css('opacity', '1')
                }
                $file.find('.file-thumb').attr('src', file.thumbs.s.src).show()
            }

            if(file.parent_file_id){
                self.$box.find(`.project-file-${file.parent_file_id}`).hide()
            }

        }else{
            var $children = self.$box.find(`.project-child-item-${file.id}`)
            if($children.length){
                $file.hide()
            }
        }
    }

    shortTitle(str) {
        if (str=='')
            return  '';
        else{
            if (isMobile('any')) {
                if (str.length > 30){
                    str=str.substring(0,30)+'...'
                    return str
                }else{
                    return str
                }
            }else {
                    return str
            }
        }
    }

    getFiles($obj) {
        var self = this
        var $folder = $obj.closest('.project-folder');
        var folder = $folder.data('folder')
        var $files = $folder.next()
        if($files.hasClass('unloaded')){
            GETRequest(ProjectsUrls.api.projectFiles(self.project.id), {type:'all', folder: folder.id}, function(files){
                for(let file of files){
                    var $file = self.renderOrRefreshFile(folder.id, file)
                }
                $files.removeClass('unloaded')
                $folder.addClass('open')
            })
        }else{
            $folder.toggleClass('open')
        }
    }

    renderProjectFolderHtml(folder) {
        var self = this;

        var $folder = $($('#project-folder-template').render({
            folder:folder,
            company: self.user.getCompany()
        }))

        if (!isMobile('any')) {
            $folder.find('.btn').addClass('btn-sm')
        }

        $folder.data('folder', folder)
        $folder.find(`.folder-access-${folder.access}`).removeClass('hide')

        $folder.find('.toggle-folder-files-btn').bind( "click", function () {
            self.getFiles($(this))
        });
        $folder.find('.change-folder-access-btn').click(function(){
            var $btn = $(this)
            var $folder = $btn.closest('.project-folder')
            var folder = $folder.data('folder')
            var company = self.user.getCompany()
            if(company.id == folder.owner.company.id){
                var access = folder.access == 'public' ? 'private' : 'public'
                PUTRequest(ProjectsUrls.api.projectFolder(self.project.id, folder.id), {access:access}, function(folder){
                    $folder.data('folder', folder)
                    $folder.find('.folder-access').addClass('hide')
                    $folder.find(`.folder-access-${folder.access}`).removeClass('hide')
                })
            }
            return false
        })
        $folder.find('.remove-project-folder-bnt').click(function () {
            var $e = $(this);
            var $folder = $e.closest('.project-folder');
            var folder = $folder.data('folder')

            swal({
                title: gettext("Are you sure?"),
                text: gettext("You will not be able to recover this folder!"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Yes, delete it!"),
                cancelButtonText: gettext("No, cancel!"),
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm){
                if (isConfirm) {
                    if (folder) {
                        DELETERequest(ProjectsUrls.api.projectFolder(self.project.id, folder.id), function (response) {
                            $folder.remove();
                            $('.folder-files-'+folder.id).remove()
                            swal({
                                title: gettext('Deleted!'),
                                text: gettext("Your folder has been deleted."),
                                type: "success",
                                timer: 1500,
                                showConfirmButton: false
                            })
                        });
                    }
                } else {
                    swal(gettext("Cancelled"), gettext("Your folder is safe :)"), "error")
                }
            })

        });
        $folder.find('.show-folder-form-btn').click(function () {
            var $folder = $(this).closest('.project-folder')
            var folder = $folder.data('folder')
            $folder.find('.folder-title').hide()
            $folder.find('.edit-folder-title').val(folder.title).show()
            $folder.find('.edit-folder-form').show()
        })

        $folder.find('.edit-folder-title').data('remote', ProjectsUrls.api.addProjectFolder(self.project.id)+`?folder_id=${folder.id}`)

        $folder.find('.edit-folder-form').validator().on('submit', function(e){
            if (e.isDefaultPrevented()) {
                return false
            }
            var $folder = $(this).closest('.project-folder')
            var folder = $folder.data('folder')
            var data = $folder.find('.edit-folder-form').serialize()
            PUTRequest(ProjectsUrls.api.projectFolder(self.project.id, folder.id), data, function(folder){
                $folder.data('folder', folder)
                //var title = self.shortTitle(folder.title)
                var title = folder.title
                $folder.find('.folder-title').text(title).show()
                $folder.find('.edit-folder-form').hide()
            })
            return false
        })

        if (!isMobile('iOS'))
            $folder.find('.fileupload').attr('multiple')

        $folder.find('.fileupload').fileupload({
            add: (e, data) => {
                var error
                var jsguid = guid()

                data.url = ProjectsUrls.api.addProjectFile(this.project.id)
                data.formData = {'folder': folder.id, 'jssid':'1234', jsguid: jsguid}

                for(let file of data.files) {
                    if (file.type.length && !this.uploadconf.accept_file_types.test(file.type)) {
                        error = gettext('Not an accepted file type: ') + file.type
                    }
                    if (file.name.length && !this.uploadconf.accept_file_extensions.test(file.name)) {
                        error = gettext('Not an accepted filename: ') + file.name
                    }
                    if (file.size && file.size > this.uploadconf.max_file_size) {
                        error = gettext('Filesize is too big. Allowed ') + bytesToSize(self.max_file_size)
                    }

                    var $clickOnfolder =  $folder.find('.toggle-folder-files-btn').first()
                    self.getFiles($clickOnfolder)
                    $folder.addClass('open')

                    file.jsguid = jsguid
                    var $file = self.renderOrRefreshFile(folder.id, file)

                    $file.find('.upload-cancel-btn').show().click((e) => data.abort())
                    $file.find('.progress').show()
                    data.context = $file
                    if (error) {
                        $file.addClass('has-error').find('.help-block').text(error)
                    } else {
                        data.submit()
                    }
                }
            },
            progress: (e, data) => {
                var $progress = data.context.find('.progress')
                var progress = parseInt(data.loaded / data.total * 100, 10)
                $progress.find('.sr-only').text(progress + gettext(' complete...'))
                $progress.find('.progress-bar').attr({
                    style: 'width:' + progress + '%',
                    'aria-valuenow': progress
                })
            },
            done: (e, data) => {
                var file = data.result
                var $file = this.$box.find(`.project-file-${file.jsguid}`)
                $file.find('.progress').hide()
                $file.find('.upload-cancel-btn').hide()
                this.bindFileButtons($file)
                this.refreshFile($file, file)
            },
            fail: (e, data) => {
                if (data.errorThrown != 'abort') {
                    var $file = data.context
                    var errors = $.parseJSON(data.jqXHR.responseText)
                    for(let field in errors) {
                        let error = errors[field][0]
                        $file.addClass('has-error').find('.help-block').text(error)
                        break
                    }
                }
            },
            dataType: 'json',
            singleFileUploads: true,
            autoUpload: true
        })

        return $folder
    }

    renderOrRefreshFile(folder_id, file){
        var self = this
        var $file

        if(self.fileAlreadyRendered(file)){
            $file = self.$box.find('.project-file-'+file.jsguid);
            self.refreshFile($file, file);
        }else{
            $file = this.renderProjectFileHtml(file)
            var $files = self.$box.find('.folder-files-'+folder_id)
            $files.prepend($file)
        }
        return $file
    }

    event(name, data, time){
        if(name == 'projects:projectimage_created'){
            return this.onFileUpdated(data.data, data.evsid, time)
        }
        if(name == 'projects:projectimage_updated'){
            return this.onFileUpdated(data.data, data.evsid, time)
        }
        if(name == 'projects:projectfile_created'){
            return this.onFileUpdated(data.data, data.evsid, time)
        }
        if(name == 'projects:projectfile_updated'){
            return this.onFileUpdated(data.data, data.evsid, time)
        }
    }

    fileAlreadyRendered(file){
        var self = this
        return Boolean(self.renderedFiles[file.jsguid])
    }

    onFileUpdated(file, evsid, time) {
        var self = this
        if(!file || !file.project_id || self.project.id != file.project_id){
            return
        }
        self.renderOrRefreshFile(file.folder_id, file)
    }
}