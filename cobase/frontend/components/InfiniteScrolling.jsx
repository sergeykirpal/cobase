import InfiniteScroll from 'redux-infinite-scroll';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import {connect} from 'react-redux';


class InfiniteScrolling extends InfiniteScroll {
    componentDidMount(){
        this.scrollToPosition()
        super.componentDidMount()
    }

    componentWillUnmount(){
        const {dispatch, box, scrollPos} = this.props;
        var $box = $(`.${box}`)
        $box.removeClass('scrolled')
        super.componentWillUnmount()
    }

    scrollToPosition(){
        const {dispatch, box, scrollPos} = this.props;

        var $box = $(`.${box}`)
        if(!$box.hasClass('scrolled') && scrollPos){
            if(scrollPos > 0){
                setTimeout(function(){
                    $box.scrollTop(scrollPos)
                }, 200)
            }
            $box.addClass('scrolled')
        }
    }

    componentDidUpdate(){
        const {dispatch, box, scrollPos} = this.props;
        this.scrollToPosition()
        super.componentDidUpdate()
    }
}

function mapStateToProps(state, props) {
    const {environment, auth, site} = state;

    return {
        environment,
        scrollPos: site.scrollBoxes[props.box],
    };
}

export default connect(mapStateToProps)(InfiniteScrolling);
