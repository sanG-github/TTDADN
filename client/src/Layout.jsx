import React, {Suspense} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faSeedling,faChartBar , faBook, faLeaf,faDatabase } from '@fortawesome/free-solid-svg-icons'
import { Layout, Menu} from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';
import {
    BrowserRouter as Router,    
    Switch,
    Route,
    Link
  } from "react-router-dom";
import ControlPanel from './pages/ControlPanel';
import CurrentFigure from './pages/CurrentFigure';
import Statistic from './pages/Statistic';
import Record from './pages/Record';
import GardenControl from './pages/GardenControl';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    const { collapsed } = this.state;
    return (
      <div>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse} width='250'>
              {/* <div className="logo" /> */}
              <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                <Menu.Item key="1" icon={<FontAwesomeIcon icon={faSeedling} />}>
                    <Link to="/">Trạng thái vườn</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<FontAwesomeIcon icon={faChartBar} />}>
                    <Link to="/statistic">Thống kê</Link>
                </Menu.Item>
                <SubMenu key="sub1" icon={<UserOutlined />} title="Feature 1">
                  <Menu.Item key="3">Feature 1a</Menu.Item>
                  <Menu.Item key="4">Feature 1b</Menu.Item>
                  <Menu.Item key="5">Feature 1c</Menu.Item>
                </SubMenu>
                <Menu.Item key="11" icon={<FontAwesomeIcon icon={faDatabase} />}>
                    <Link to="/record">Bảng dữ liệu</Link>
                </Menu.Item>
                <Menu.Item key="10" icon={<FontAwesomeIcon icon={faCogs} />}>
                    <Link to="/control-panel">Trung tâm điều khiển</Link>
                </Menu.Item>
                <Menu.Item key="12" icon={<FontAwesomeIcon icon={faCogs} />}>
                    <Link to="/garden-control">Điều khiểm vườn</Link>
                </Menu.Item>
              </Menu>
            </Sider>
            <Layout className="site-layout">
              <Header className="site-layout-background" style={{ padding: 0 }} >
                <div className="Header"><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
              </Header>
              <Content style={{ margin: '0 16px' }}>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <Switch>
                    <Suspense fallback={<h1>....</h1>}>
                    <Route exact path="/">
                        <CurrentFigure />
                    </Route>
                    <Route exact path="/control-panel">
                        <ControlPanel />
                    </Route>
                    <Route exact path="/record">
                        <Record />
                    </Route>
                    <Route exact path="/statistic">
                        <Statistic />
                    </Route>
                    <Route exact path="/garden-control">
                        <GardenControl />
                    </Route>
                    </Suspense>
                </Switch>
                </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>Smart Tomato Garden</Footer>
            </Layout>
          </Layout>
        </Router>
      </div>
    );
  }
}

export default SiderDemo