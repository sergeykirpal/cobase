import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import Menu from 'components/Menu.jsx'
import {pathMatch} from 'utils/url.es6'


class MenuMobile extends Component {
    componentDidMount(){
        this.initSlideout(this.touchEvent(this.props))
    }

    componentWillUnmount(){
        this.removeSlideout()
    }

    touchEvent(props){
        var {path} = props

        var touchEvent = true
        if(pathMatch(path, '/drawing')){
            touchEvent = false
        }
        if(pathMatch(path, '/task/')){
            touchEvent = false
        }

        return touchEvent

        //var link = location.href;
        //if ((link.indexOf('/projects/task/') + 1))
        //    TouchEvent = false;
        //if ((link.indexOf('/overview') + 1))
        //    TouchEvent = false;
        //if ((link.indexOf('/drawings') + 1))
        //    TouchEvent = false;
        //if ((link.indexOf('/projects/drawing') + 1))
        //    TouchEvent = false;
        //if ((link.indexOf('/update') + 1))
        //    TouchEvent = false;
        //if ((link.indexOf('/projects/add/') + 1))
        //    TouchEvent = false;
        //
        //if ($('.message-for-empty-drawing-map').attr('data') == '1')
        //    TouchEvent = true;

    }

    initSlideout(touchEvent=true){
        window.slideout = new Slideout({
            'panel': document.getElementById('panel'),
            'menu': document.getElementById('menu'),
            'padding': 200,
            'tolerance': 70,
            'touch': touchEvent
        }).on('open', function() {
            $('.pagecontent').prepend('<div class="block-page-content"></div>');
            $('.pagecontent').addClass('pagecontent-no-scroll');

        }).on('close', function() {
            $('.pagecontent').removeClass('pagecontent-no-scroll');
            $('.pagecontent').find('.block-page-content').remove();
        });
    }

    removeSlideout(){
        if(window.slideout){
            slideout.destroy()
        }
    }

    componentWillReceiveProps(nextProps){
        if(this.props.path != nextProps.path){
            var currentTouchEvent = this.touchEvent(this.props)
            var newTouchEvent = this.touchEvent(nextProps)
            if(currentTouchEvent != newTouchEvent){
                this.removeSlideout()
                this.initSlideout(newTouchEvent)
            }
        }
    }

    render(){
        return (
            <nav id="menu" className="mainbox menu-mobile">
                <div className="menu">
                    <Menu className="menu-list" />
                </div>
            </nav>
        );
    }
}

MenuMobile.propTypes = {
    path: PropTypes.string.isRequired,
}


function mapStateToProps(state, props) {
    const {environment} = state;

    return {
        environment,
    };
}

export default connect(mapStateToProps)(MenuMobile);
