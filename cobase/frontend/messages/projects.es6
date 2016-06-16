export default {
    taskInProgress() {
         swal({
            title: '<div class="btn statuses inProgress">'+gettext('In Progress')+'</div>'+gettext('You started with task!'),
            text: gettext("Task is now in progress."),
            html: true,
            timer: 2000,
            showConfirmButton: false
        })
    },
    taskDone() {
        swal({
            title: gettext('Great work!'),
            text: gettext("You completed task!"),
            type: "success",
            timer: 2000,
            showConfirmButton: false
        })
    },
    alertDone() {
        swal({
            title: gettext('Quick work!'),
            text: gettext("You have solved the alert!"),
            type: "success",
            timer: 2000,
            showConfirmButton: false
        })
    },
    timerStop(time){
         swal({
            title: '<div class="alertTimerStop"><img src="/static/images/stoptimer.svg" class="timerStop"/></div>'+gettext('Timer is stopped!'),
            text: gettext('You worked today')+' <br><div class="alertTimer">'+time+'</div>',
            html: true,
            timer: 2000,
            showConfirmButton: false
        })
    },
    timerStart(){
         swal({
            title: '<div class="alertTimerStop"><img src="/static/images/stoptimer.svg" class="timerStop"/></div>'+gettext('Timer is activated!'),
            text: gettext("You will be directed into project now!"),
            html: true,
            timer: 2000,
            showConfirmButton: false
        })
    }
}