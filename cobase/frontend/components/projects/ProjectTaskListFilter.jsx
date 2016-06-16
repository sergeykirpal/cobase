import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {User} from 'classes/auth.es6'
import {ProjectsUrls, AuthUrls} from 'constants/Urls.es6'
import ProjectTimer from 'components/projects/ProjectTimer.jsx'
import {truncate} from 'utils/string.es6'
import {changeLocation} from 'actions/site.es6'
import {modal} from 'react-redux-modal'
import ProjectTaskModalContainer from 'containers/projects/ProjectTaskModalContainer.jsx'
import {toggleActiveProjectTasksFilter, activeProjectTasksSetItemsReset, activeProjectTasksSetFilterReset, activeProjectTasksSetFilterChanged, changeActiveProjectTaskDetailsViewMode} from 'actions/projects.es6'
import {isMobile} from 'utils/environment.es6'


class ProjectTaskListFilter extends Component {
    componentDidMount(){
        const {dispatch, setName} = this.props;
        this.bindButtons()
    }

    onTargetButton(event){
        const {dispatch, setName, params} = this.props;
        var target = [].concat(params['target'])
        var value = event.target.value
        var pos = target.indexOf(value)
        if(event.target.checked){
            target = [value]
        }else{
            if(pos != -1){
                target.splice(pos, 1)
            }
        }
        dispatch(activeProjectTasksSetFilterChanged(setName, {target: target}))
    }

    onFindButton(event){
        const {dispatch, setName, params} = this.props;
        dispatch(activeProjectTasksSetItemsReset(setName))
        dispatch(toggleActiveProjectTasksFilter(false))
        event.preventDefault()
    }

    onResetFilterButton(){
        const {dispatch, setName, params} = this.props;
        dispatch(activeProjectTasksSetFilterReset(setName))
    }

    onResetSearchFilterButton(){
        const {dispatch, setName} = this.props;
        dispatch(activeProjectTasksSetFilterChanged(setName, {keyword: ''}))
    }

    onStatusButton(event){
        const {dispatch, params, setName} = this.props;
        var statuses = [].concat(params['statuses'])
        var value = event.target.value
        var pos = statuses.indexOf(value)
        if(event.target.checked){
            if(pos == -1){
                statuses.push(value)
            }
        }else{
            if(pos != -1){
                statuses.splice(pos, 1)
            }
        }
        dispatch(activeProjectTasksSetFilterChanged(setName, {statuses: statuses}))
    }

    onAccessTypeButton(event){
        const {dispatch, params, setName} = this.props;

        var accessType = [].concat(params['access-type'])
        var value = event.target.value
        var pos = accessType.indexOf(value)
        if(event.target.checked){
            if(pos == -1){
                accessType.push(value)
            }
        }else{
            if(pos != -1){
                accessType.splice(pos, 1)
            }
        }
        dispatch(activeProjectTasksSetFilterChanged(setName, {'access-type': accessType}))
    }

    onChangeViewButton(event){
        const {dispatch, setName, params} = this.props
        dispatch(activeProjectTasksSetFilterChanged(setName, {view: event.target.checked ? event.target.value : ''}))
        if(!params['target'].length){
            dispatch(activeProjectTasksSetFilterChanged(setName, {target: ['sent']}))
        }
    }

    onSearchButton(event){
        const {dispatch, setName} = this.props
        dispatch(activeProjectTasksSetFilterChanged(setName, {keyword: event.target.value}))
    }

    bindButtons(){
        const {dispatch, setName, project} = this.props;
        var $filter = $('.tasks-filter')
        $filter.find('.search-filter').autocomplete({
            appendTo: ".search-filter-autocomplete",
            params:{type: 'apu', datatype: 'ac', project:project.id},
            serviceUrl: AuthUrls.api.users,
            onSelect: (suggestion) => {
                dispatch(activeProjectTasksSetFilterChanged(setName, {keyword: suggestion.value}))
            }
        })
    }

    render() {
        const {dispatch, visible, height, setName, params} = this.props;

        return (
            <div className={`filter-block tasks-filter ${visible?'opened':'hide'}`} style={{height: `${height}px`}}>
                <form method="post" className="filter-block-form" onSubmit={this.onFindButton.bind(this)}>
                    <div className="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <div className="input-group" style={{width: '100%'}}>
                            <span className={`input-group-btn reset-search-filter-btn ${!params['keyword'].length ? 'hide' : ''}`} >
                                <button onClick={this.onResetSearchFilterButton.bind(this)} className="btn btn-default" type="button"><i className="fa fa-remove"> </i></button>
                            </span>
                            <input value={params['keyword']} onChange={this.onSearchButton.bind(this)} type="text" name="keyword" placeholder="Search..." className="form-control search-filter" autoComplete="off" />
                            <div className="search-filter-autocomplete" style={{marginTop: '35px'}}>
                                <div className="autocomplete-suggestions" style={{position: 'absolute', 'maxHeight': '300px', 'zIndex': '9999'}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="clear"></div>
                    
                    <div className="form-group project-task-form col-xs-12 col-sm-4 col-md-4 col-lg-4">
                        <div className="view-filter-box">
                            <label className="css-input css-checkbox css-checkbox-primary">
                                <input name="view" value="byuser" onChange={this.onChangeViewButton.bind(this)} checked={params['view'] == 'byuser'} type="checkbox" className="view-filter" /><span> </span> <b>ORDER BY USER</b>
                            </label>
                        </div>                       
                        <div className={`target-filter ${params['targetVisible'] ? '' : 'hide'}`}>
                            <label className="css-input css-radio css-radio-primary push-10-r">
                                <input value="sent" onChange={this.onTargetButton.bind(this)} checked={params['target'].indexOf('sent') != -1} type="radio" name="target" className="target-sent" /><span> </span> <span className="label label-primary label-lg ">SENT</span>
                            </label>
                            <label className="css-input css-radio css-radio-danger push-10-r">
                                <input value="received" onChange={this.onTargetButton.bind(this)} checked={params['target'].indexOf('received') != -1} type="radio" name="target" className="target-received" /><span> </span> <span className="label label-danger label-lg ">RECEIVED</span>
                            </label>
                        </div>
                    </div>
        
                    <div className={`form-group project-task-form access-type-filter col-xs-12 col-sm-4 col-md-4 col-lg-4 ${params['accessTypeVisible'] ? '' : 'hide'}`}>
                        <label className="css-input css-checkbox css-checkbox-primary push-10-r">
                            <input value="internal" onChange={this.onAccessTypeButton.bind(this)}  className="access-type-internal" name="access-type" type="checkbox" checked={params['access-type'].indexOf('internal') != -1} /><span> </span> INTERNAL
                        </label>
                        <br />
                        <label className="css-input css-checkbox css-checkbox-primary push-10-r">
                            <input value="external" onChange={this.onAccessTypeButton.bind(this)} className="access-type-external" name="access-type" type="checkbox" checked={params['access-type'].indexOf('external') != -1} /><span> </span> EXTERNAL
                        </label>
                    </div>

                    <div className="task-status-filter form-group project-task-form col-xs-12 col-sm-4 col-md-4 col-lg-4">
                        {params['statusesVisible'].indexOf('todo') != -1 ? <label className="todo-label css-input css-checkbox css-checkbox-primary"> <input name="statuses" value="todo" type="checkbox" onChange={this.onStatusButton.bind(this)} checked={params['statuses'].indexOf('todo') != -1} /><span> </span> <span className="label label-primary label-lg">todo</span> </label>: null}
                        <br />
                        {params['statusesVisible'].indexOf('progress') != -1 ? <label className="progress-label css-input css-checkbox css-checkbox-primary"> <input name="statuses" value="progress" type="checkbox" onChange={this.onStatusButton.bind(this)} checked={params['statuses'].indexOf('progress') != -1} /><span> </span> <span className="label label-warning">progress</span> </label> : null}
                        <br />
                        {params['statusesVisible'].indexOf('pause') != -1 ? <label className="pause-label css-input css-checkbox css-checkbox-primary"> <input name="statuses" value="pause" type="checkbox" onChange={this.onStatusButton.bind(this)} checked={params['statuses'].indexOf('pause') != -1} /><span> </span> <span className="label label-danger">pause</span> </label> : null}
                        <br />
                        {params['statusesVisible'].indexOf('done') != -1 ? <label className="done-label css-input css-checkbox css-checkbox-primary"> <input  value="done" onChange={this.onStatusButton.bind(this)} name="statuses" type="checkbox" checked={params['statuses'].indexOf('done') != -1} /><span> </span> <span className="label label-success">done</span> </label>:null}
                    </div>

                    <div className="clear"></div>     
                    <div className="form-group col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <button onClick={this.onFindButton.bind(this)} type="button" className="btn btn-success find-tasks-btn">{gettext('FIND')}</button>&nbsp;
                        <button onClick={this.onResetFilterButton.bind(this)} type="button" className="btn btn-warning clear-filter-btn">{gettext('CLEAR ALL')}</button>
                    </div>
                    <div className="clear"></div>                       
                </form>
            </div>
        )
    }
}

ProjectTaskListFilter.propTypes = {
    project: PropTypes.object.isRequired,
    setData: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    setName: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
    const {environment, auth} = state;
    return {
        environment,
        user: auth.user
    };
}

export default connect(mapStateToProps)(ProjectTaskListFilter);
