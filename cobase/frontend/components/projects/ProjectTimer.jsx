import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {User} from 'classes/auth.es6'
import {stopProjectTimerRequest, startProjectTimerRequest, projectTimerShowed, projectTimerHided} from 'actions/projects.es6'
import projectsMessages from 'messages/projects.es6'
var moment = require('moment');

class ProjectTimer extends Component {
    componentDidMount(){
        var {dispatch, single} = this.props
        this.toggleTimer(this.props)
        if(single){
            App.initHelpers('easy-pie-chart')
        }
    }

    componentWillReceiveProps(nextProps){
        this.toggleTimer(nextProps)
    }

    componentWillUnmount(){
        this.hide()
    }

    toggleTimer(props){
        var {dispatch, log, project} = props
        var isRunning = this.isRunning()
        if(!log && isRunning){
            return this.hide()
        }else if(log && !isRunning){
            var logDate = moment(log.day_start_time)
            var retrievedDate = moment(log.retrieved)
            if(retrievedDate.utcOffset('+0100').format('L') == logDate.utcOffset('+0100').format('L')){
                this.show(props)
            }
        }
    }

    start() {
        var {dispatch, log, project, afterStart} = this.props

        if(this.isRunning()){
           return
        }

        projectsMessages.timerStart()
        var $box = $(`.project-timer-${project.id}`)
        $box.find('.start-work-btn').hide()
        $box.find('.img-loading').show()
        dispatch(startProjectTimerRequest(project))
        if(typeof afterStart == 'function'){
            afterStart()
        }
    }

    show(props) {
        var {log, project, dispatch} = props
        if(!log){
            return
        }
        var $box = $(`.project-timer-${project.id}`)
        var previousSeconds = log.day_total_worked_seconds
        var previousTime = log.day_total_worked_time

        var serverEndDate = moment(log.day_max_time)
        var serverNowDate = moment(log.retrieved)
        var sessionMaxSeconds = serverEndDate.diff(serverNowDate, 'seconds')

        var timerStartDate = moment()
        var timerNowDate
        var sessionSeconds
        var seconds

        console.log('timer day first start: '+moment(log.day_start_time).format())
        console.log('timer day previous worked time: '+previousTime)
        console.log('timer launched: '+serverNowDate.format())
        console.log('timer will stop: '+serverEndDate.format())
        console.log('timer will stop after seconds: '+sessionMaxSeconds)

        App.initHelpers('easy-pie-chart')
        $box.find('.img-loading').hide()
        $box.find('.start-work-btn').hide()
        $box.find('.stop-work-btn').show()
        $box.find('.time').show()

        var interval = setInterval(() => {
            timerNowDate = moment()
            sessionSeconds = timerNowDate.diff(timerStartDate, 'seconds')
            seconds = previousSeconds + sessionSeconds

            if (sessionSeconds >= sessionMaxSeconds) {
                return this.stop();
            }

            var duration = moment.duration(seconds, 'seconds');
            var hours = Math.floor(duration.asHours());
            if(hours < 10){
                hours = `0${hours}`
            }
            var mins = Math.floor(duration.asMinutes()) - (hours * 60);
            if(mins < 10){
                mins = `0${mins}`
            }
            var sec = Math.floor(seconds) - (hours * 3600) - (mins * 60);
            if(sec < 10){
                sec = `0${sec}`
            }
            var time =  `${hours}:${mins}:${sec}`;
            $box.find('.time').text(time)

            var parcent = 0
            var circle = $box.find('.timer')
            var pieColor = false

            parcent = (seconds * 100 ) / 32400
            parcent = parseInt(parcent, 10)
            circle.attr('data-percent', parcent)

            if (parcent>=100){
                parcent = (seconds * 100 ) / 86400
                parcent = parseInt(parcent,10)
                circle.attr('data-percent',parcent)
                pieColor = true
            }

            var charts = $('.js-pie-chart')
            $.each(charts, function (key, chart) {
                var $chart = $(chart)
                if($chart.length){
                    if($chart.data('easyPieChart')){
                        var parcent = $chart.attr('data-percent')
                        if (pieColor){
                            $chart.data('easyPieChart').options.barColor = '#ef8354';
                        }
                        $chart.data('easyPieChart').update(parcent)
                    }
                }
            });
        }, 1000)

        $box.addClass('running')
        $box.data('interval', interval)

        dispatch(projectTimerShowed(serverNowDate, serverEndDate))
    }

    hide(){
        var {dispatch, log, project} = this.props
        var $box = $(`.project-timer-${project.id}`)
        var interval = $box.data('interval')
        $box.find('.stop-work-btn').hide()
        $box.find('.start-work-btn').show()
        $box.find('.img-loading').hide()
        $box.find('.time').hide()
        $box.removeClass('running')
        if(interval){
            clearInterval(interval);
        }
        dispatch(projectTimerHided())
    }

    stop() {
        var {dispatch, log, project} = this.props

        if(this.isRunning()){
            var $box = $(`.project-timer-${project.id}`)
            $box.find('.img-loading').show()
            $box.find('.stop-work-btn').hide()
            dispatch(stopProjectTimerRequest(log, () => {
                var time = this.getLogTime(log)
                projectsMessages.timerStop(time)
            }))
        }
    }

    getLogTime(log){
        var seconds = log.day_total_worked_seconds || 0
        var duration = moment.duration(seconds, 'seconds')
        var hours = Math.floor(duration.asHours())

        var mins = Math.floor(duration.asMinutes()) - (hours * 60)
        if(mins < 10){
            mins = `0${mins}`
        }
        var sec = Math.floor(seconds) - (hours * 3600) - (mins * 60)
        if(sec < 10){
            sec = `0${sec}`
        }
        return `${hours}h ${mins}min`
    }

    isRunning(){
        var {dispatch, log, project} = this.props
        var $box = $(`.project-timer-${project.id}`)
        return $box.hasClass('running')
    }

    render(){
        const {dispatch, project} = this.props

        return (
            <div className={`col-md-3 col-xs-12 col-sm-3 text-center for-timer-box project-timer-${project.id}`}>
                <div className="js-pie-chart pie-chart timer" data-percent="0" data-line-width="7" data-size="80" data-bar-color="#abe37d" data-track-color="#eeeeee">
                    <span>
                        <div className="time"></div>
                        <img src="/static/img/loading.gif" className="img-loading" style={{display: 'none'}}/>
                        <small onClick={this.start.bind(this)} className="text-muted stop-start start-work-btn">{gettext("START")}</small>
                        <small onClick={this.stop.bind(this)} className="text-muted stop-start stop-work-btn" style={{display: 'none'}}>{gettext("STOP")}</small>
                    </span>
                </div>
            </div>
        );
    }
}

ProjectTimer.propTypes = {
    project: PropTypes.object.isRequired,
    single: PropTypes.bool,
    afterStart: PropTypes.func,
}

function mapStateToProps(state, props) {
    const {environment, auth, projects} = state;
    var project = props.project
    var user = auth.user

    return {
        environment,
        user: user,
        log: project.id in user.projectsuserlogs.active ? user.projectsuserlogs.active[project.id] : null,
    };
}

export default connect(mapStateToProps)(ProjectTimer);
