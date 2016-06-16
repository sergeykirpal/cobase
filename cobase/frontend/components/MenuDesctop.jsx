import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router'
import {isMobile} from 'utils/environment.es6'
import Menu from 'components/Menu.jsx'


class MenuDesctop extends Component {
    componentDidMount(){
        const {height} = this.props
        $('.menu-desctop .slim-scroll').slimScroll({
            height: `${height}px`
        });
    }

    render(){
        const {environment} = this.props

        return (
            <div className="menu-desctop menu col-md-2" >
                <div className="slim-scroll">
                    <Menu />
                </div>
            </div>
        );
    }
}

MenuDesctop.propTypes = {
    height: PropTypes.number.isRequired
}

function mapStateToProps(state, props) {
    const {environment} = state;

    return {
        environment,
    };
}

export default connect(mapStateToProps)(MenuDesctop);
