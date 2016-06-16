window.moment = require('moment');
require('script!static/js/jquery/jquery-1.11.2.min.js')
require('script!static/mobileapp/bridge.js')
require('script!static/bootstrap/bootstrap.min.js')
require('script!static/bootstrap/select/js/bootstrap-select.js')
require('script!slideout/dist/slideout.min.js')
require('script!static/js/jquery/plugins/jquery.cookie.js')
require('script!static/js/crlf-app.js')
require('script!static/js/jquery/plugins/jsrender.js')
require('script!static/js/validator.js')
require('script!static/js/modernizr.js')
//require('script!static/js/jquery/jquery-deparam.js')

require('script!static/js/jquery/plugins/json-scroll/jquery.json-scroll.js')
require('script!static/js/jquery.formparams.js')
require('script!static/bootstrap/bootstrap-datetimepicker/js/bootstrap-datetimepicker.js')
require('script!static/bootstrap/bootstrap-datepicker/js/bootstrap-datepicker.js')
require('script!static/js/jquery/plugins/autocomplete/jquery.autocomplete.js')
require('script!static/oneui/js/core/jquery.slimscroll.min.js')
require('script!static/oneui/js/core/jquery.scrollLock.min.js')
require('script!static/oneui/js/core/jquery.placeholder.min.js')
require('script!static/oneui/js/app.js')
require('script!static/js/sweet-alert/sweet-alert.min.js')
require('script!static/oneui/js/plugins/easy-pie-chart/jquery.easypiechart.min.js')
require('script!static/js/mask.js')
require('script!static/js/jquery/plugins/jquery.translit-0.1.3.js')

require('script!static/js/pickadate/picker.js')
require('script!static/js/pickadate/picker.date.js')
require('script!static/js/pickadate/legacy.js')
require('script!static/js/flatdatatimepicker/DateTimePicker.js')

require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/L.TileLayer.Zoomify.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/Leaflet.draw.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/Edit.Poly.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/Edit.SimpleShape.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/Edit.Circle.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/Edit.Rectangle.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Feature.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Polyline.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Polygon.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.SimpleShape.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Rectangle.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Circle.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/handler/Draw.Marker.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/TouchEvents.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/LatLngUtil.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/GeometryUtil.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/LineUtil.Intersect.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/Polyline.Intersect.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/ext/Polygon.Intersect.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/Control.Draw.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/Tooltip.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/Toolbar.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/draw/DrawToolbar.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/EditToolbar.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/EditToolbar.Edit.js')
require('script!static/js/leaflet/Leaflet.draw-master-micharl/Leaflet.draw-master/src/edit/handler/EditToolbar.Delete.js')
require('script!static/js/jquery/jquery.mobile.custom.min.js')

require('script!static/js/jquery/plugins/jquery-scrollto.js')
require('script!static/js/jquery/plugins/fileupload/jquery.ui.widget.js')
require('script!static/js/jquery/plugins/fileupload/load-image.all.min.js')
require('script!static/js/jquery/plugins/fileupload/canvas-to-blob.js')
require('script!static/js/jquery/plugins/fileupload/jquery.iframe-transport.js')
require('script!static/js/jquery/plugins/fileupload/jquery.fileupload.js')
require('script!static/js/jquery/plugins/fileupload/jquery.fileupload-process.js')
require('script!static/js/jquery/plugins/fileupload/jquery.fileupload-image.js')
require('script!static/js/photoswipe/photoswipe.js')
require('script!static/js/photoswipe/photoswipe-ui-default.js')

import fetch from 'isomorphic-fetch';
import 'babel-core/polyfill';
import {Urls} from 'common/urls.es6'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import configureStore from 'store/configureStore.es6'
import routes from 'routes.jsx'
import {Router, useRouterHistory, browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import useScroll from 'scroll-behavior/lib/useStandardScroll'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import ReduxModal from 'react-redux-modal'


const createScrollHistory = useScroll(createBrowserHistory)
window.appHistory = useRouterHistory(createScrollHistory)()

const store = configureStore();
const history = syncHistoryWithStore(appHistory, store)
ReactDOM.render(
    <Provider store={store}>
        <div>
            <Router history={history} routes={routes} />
            <ReduxModal />
        </div>
    </Provider>,
    document.getElementById('app')
);