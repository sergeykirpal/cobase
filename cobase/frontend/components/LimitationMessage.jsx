import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import {PaymentsUrls} from 'constants/Urls.es6'


class LimitationMessage extends Component {
    renderProjectsActiveMessage(){
        const {user} = this.props

        var activeProjectsCount = user.getVar('projectsactive', 'company_projectsactive_count')
        var activeProjectsLimit = user.getVar('projectsactive', 'company_projectsactive_count_limit')
        var userHasActiveProjectsLimitation = activeProjectsLimit !== null
        var userHasActiveProjectPermission = user.checkPermission('projectsactive', 'projectactive', 'create')
        var isUserCompanyManager = user.checkCompanyRole('manager')

        if(!userHasActiveProjectsLimitation){
            return null
        }

        if (userHasActiveProjectPermission){
            var activeProjectsLeft = activeProjectsLimit - activeProjectsCount
            if(activeProjectsLeft < 0) activeProjectsLeft = 0

            if (activeProjectsLeft == 1){
                return (
                    <div className="alert alert-warning alert-warning-border-bottom fadeIn">
                        <h3 className="font-w300 push-15">{gettext('You will soon reach your active projects limit')}</h3>
                        <p>
                            {gettext('You have only {activeProjectsLeft} project shares left.').replace('{activeProjectsLeft}', activeProjectsLeft)}
                            {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more active projects, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                        </p>
                    </div>
                )
            }
        }else {
            return (
                <div className="alert alert-danger alert-danger-border-bottom fadeIn">
                    <h3 className="font-w300 push-15">{gettext('You have reached your active projects limit')}</h3>
                    <p>
                        {gettext('You have reached  your active projects limit and can’t add active projects.')}
                        {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more active projects, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                    </p>
                </div>
            )
        }
    }

    renderProjectsAccessMessage(){
        const {user} = this.props

        var count = user.getVar('projectsaccess', 'company_projectuseraccess_count')
        var limit = user.getVar('projectsaccess', 'company_projectuseraccess_count_limit')
        var userHasLimitation = limit !== null
        var userHasCreatePermission = user.checkPermission('projectsaccess', 'projectuseraccess', 'create')
        var isUserCompanyManager = user.checkCompanyRole('manager')

        if(!userHasLimitation){
            return null
        }

        if (userHasCreatePermission){
            var itemsLeft = limit - count
            if(itemsLeft < 0) itemsLeft = 0

            if (itemsLeft == 1){
                return (
                    <div className="alert alert-warning alert-warning-border-bottom fadeIn">
                        <h3 className="font-w300 push-15">{gettext('You will soon reach your project shares limit')}</h3>
                        <p>
                            {gettext('You have only {itemsLeft} project shares left.').replace('{itemsLeft}', itemsLeft)}
                            {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more shares, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                        </p>
                    </div>
                )
            }
        }else {
            return (
                <div className="alert alert-danger alert-danger-border-bottom fadeIn">
                    <h3 className="font-w300 push-15">{gettext('You have reached your project shares limit')}</h3>
                    <p>
                        {gettext('You have reached  your project shares limit and can’t share project.')}
                        {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more shares, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                    </p>
                </div>
            )
        }
    }

    renderProjectsImagesMessage(){
        const {user} = this.props

        var count = user.getVar('projectsimages', 'company_projectimages_count')
        var limit = user.getVar('projectsimages', 'company_projectimages_count_limit')
        var userHasLimitation = limit !== null
        var userHasPermission = user.checkPermission('projectsimages', 'projectimage', 'create')
        var isUserCompanyManager = user.checkCompanyRole('manager')

        if(!userHasLimitation){
            return null
        }

        if (userHasPermission){
            var itemsLeft = limit - count
            if(itemsLeft < 0) itemsLeft = 0

            if (itemsLeft == 1){
                return (
                    <div className="alert alert-warning alert-warning-border-bottom fadeIn">
                        <h3 className="font-w300 push-15">{gettext('You will soon reach your project drawings limit')}</h3>
                        <p>
                            {gettext('You have only {itemsLeft} project drawings left.').replace('{itemsLeft}', itemsLeft)}
                            {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more drawings, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                        </p>
                    </div>
                )
            }
        }else {
            return (
                <div className="alert alert-danger alert-danger-border-bottom fadeIn">
                    <h3 className="font-w300 push-15">{gettext('You have reached your project drawings limit')}</h3>
                    <p>
                        {gettext('You have reached  your project drawings limit and can’t use some uploaded files.')}
                        {isUserCompanyManager ? <span> &nbsp; {gettext('If you need more drawings, you can change your plan')}&nbsp; <Link className="alert-link" to={PaymentsUrls.payments}>{gettext('here')}</Link> </span> : null}
                    </p>
                </div>
            )
        }
    }

    renderMessage(){
        const {allowedTypes, user} = this.props

        for(let type of allowedTypes){
            if(type == 'projectsactive'){
                return this.renderProjectsActiveMessage()
            }
            if(type == 'projectsaccess'){
                return this.renderProjectsAccessMessage()
            }
            if(type == 'projectsimages'){
                return this.renderProjectsImagesMessage()
            }
        }
    }

    render(){
        return (
            <div className="limitation-message">
                {this.renderMessage()}
            </div>
        );
    }
}

LimitationMessage.propTypes = {
    allowedTypes: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;

    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(LimitationMessage);







//window.limitationsMassager = {
//    drawingLimit(drawingLimit, prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var subject = gettext('You can upload only {drawingLimit} more drawings').replace('{drawingLimit}', drawingLimit)
//        var text = gettext('You are soon reaching your drawings upload limit.')
//        if(isCompanyManager){
//            text += ' '+gettext('If you want to upload more you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+gettext('here')+'</a>'
//        }
//
//        var massage = `
//        <div class="limitationsMassager alert alert-warning alert-warning-border-bottom fadeIn">
//            <h3 class="font-w300 push-15">${subject}</h3>
//            <p>${text}</p>
//        </div>
//        `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(massage)
//    },
//
//    reachedDrawingLimit(prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var text = gettext('You have reached  drawings limit and can’t upload any more drawings.')
//        if(isCompanyManager){
//            text += ' '+gettext('If you want to upload more you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+gettext('here')+'</a>'
//        }
//
//        var massage = `
//        <div class="limitationsMassager alert alert-danger alert-danger-border-bottom fadeIn">
//            <h3 class="font-w300 push-15">${gettext('You have reached your drawings limit')}</h3>
//            <p>${text}</p>
//        </div>
//        `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(massage)
//    },
//
//    shareLimit(sharesLeft, prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var subject = gettext('You will soon reach your share limit')
//        var text = gettext('You have only {sharesLeft} project shares left.').replace('{sharesLeft}', sharesLeft)
//        if(isCompanyManager){
//            text += ' '+gettext('If you need more projects shares  you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+gettext('here')+'</a>'
//        }
//
//        var message = `
//            <div class="limitationsMassager alert alert-warning alert-warning-border-bottom fadeIn">
//                <h3 class="font-w300 push-15">${subject}</h3>
//                <p>${text}</p>
//            </div>
//            `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(message)
//    },
//
//    reachedShareLimit(prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var subject = gettext('You have reached your shares limit')
//        var text = gettext('You have reached  your projects shares limit and can’t share any more projects.')
//        if(isCompanyManager){
//            text += ' '+ gettext('If you want to share more projects you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+ gettext('here') + '</a>'
//        }
//        var message = `
//            <div class="limitationsMassager alert alert-danger alert-danger-border-bottom fadeIn">
//                <h3 class="font-w300 push-15">${subject}</h3>
//                <p>${text}</p>
//            </div>
//            `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(message)
//    },
//
//    activeProjectsLimit(activeProjectsLeft, prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var subject = gettext('You will soon reach your active projects limit')
//        var text = gettext('You have only {sharesLeft} project shares left.').replace('{sharesLeft}', activeProjectsLeft)
//        if(isCompanyManager){
//            text += ' '+gettext('If you need more active projects, you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+gettext('here')+'</a>'
//        }
//
//        var message = `
//            <div class="limitationsMassager alert alert-warning alert-warning-border-bottom fadeIn">
//                <h3 class="font-w300 push-15">${subject}</h3>
//                <p>${text}</p>
//            </div>
//            `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(message)
//    },
//
//    reachedActiveProjectsLimit(prependElement) {
//        var isCompanyManager = User.checkCompanyRole('manager')
//        var subject = gettext('You have reached your active projects limit')
//        var text = gettext('You have reached  your active projects limit and can’t add active projects.')
//        if(isCompanyManager){
//            text += ' '+ gettext('If you want to create more projects you can change your plan')
//            text += ' <a class="alert-link" href="/payments">'+ gettext('here') + '</a>'
//        }
//        var message = `
//            <div class="limitationsMassager alert alert-danger alert-danger-border-bottom fadeIn">
//                <h3 class="font-w300 push-15">${subject}</h3>
//                <p>${text}</p>
//            </div>
//            `
//        prependElement.find('.limitationsMassager').remove()
//        prependElement.prepend(message)
//    }
//}
