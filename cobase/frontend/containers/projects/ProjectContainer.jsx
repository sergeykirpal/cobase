import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import Loading from 'components/Loading.jsx'
import {changeLocation} from 'actions/site.es6'
import {ProjectsUrls} from 'constants/Urls.es6'
import {isMobile} from 'utils/environment.es6'
import ProjectCRUDForm from 'components/projects/ProjectCRUDForm.jsx'
import {Project} from 'classes/projects/common.es6'
import {guid} from 'utils/string.es6'

export default class ProjectContainer extends Component {
    getNewProject(){
        const {dispatch, user} = this.props;
        var companyUsers = $.extend(true, [], user['companyusers'])
        var index = 0
        for(let companyUser of companyUsers){
            companyUsers[index]['project_role'] = null
        }

        return new Project({
            guid:guid(),
            title:'',
            coordinates:[],
            description: '',
            start_date: '',
            end_date: '',
            workday_start_formatted: '06:00',
            workday_end_formatted: '16:00',
            companyusers: companyUsers,
            users:{
                managers:[],
                directors:[],
                workers:[],
            }
        })
    }
    renderContent() {
        const {dispatch, project} = this.props;
        if(project){
            return <ProjectCRUDForm project={project} key={`project-page-${project.guid}`}/>
        }
    }
}