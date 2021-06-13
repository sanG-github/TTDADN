import React, { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCogs,
    faSeedling,
    faChartBar,
    faLeaf,
    faDatabase,
    faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Layout, Menu } from "antd";
import { UserOutlined, ControlOutlined } from "@ant-design/icons";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ControlPanel from "./pages/ControlPanel";
import CurrentFigure from "./pages/CurrentFigure";
import Statistic from "./pages/Statistic";
import Record from "./pages/Record";
import Logout from "./pages/Logout";
import Account from "./pages/Account";
import GardenControl from "./pages/GardenControl";
import axios from "axios";
import UserInfo from "./pages/UserInfo";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const SiderDemo = () => {
    const [state, setState] = useState({
        collapsed: false,
    });
    const [loggedIn, setLoggedIn] = useState(false);

    const onCollapse = (collapsed) => {
        console.log(collapsed);
        setState({ ...state, collapsed });
    };

    useEffect(() => {
        axios.get("http://localhost:3001/api/login").then((res) => {
            setLoggedIn(res.data.loggedIn);
        });
    }, []);

    if (!loggedIn) return <Account setLoggedIn={setLoggedIn} />;

    return (
        <div>
            <Router>
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider
                        collapsible
                        collapsed={state.collapsed}
                        onCollapse={(collapsed) => onCollapse(collapsed)}
                        width="250"
                    >
                        {/* <div className="logo" /> */}
                        <Menu
                            theme="dark"
                            defaultSelectedKeys={["1"]}
                            mode="inline"
                        >
                            <SubMenu
                                key="sub1"
                                icon={<UserOutlined />}
                                title="Quản lý tài khoản"
                            >
                                <Menu.Item key="3">Feature 1a</Menu.Item>
                                <Menu.Item
                                    key="4"
                                >
                                    <Link to="/user">Thông tin người dùng</Link>
                                </Menu.Item>
                                <Menu.Item
                                    key="5"
                                    icon={<FontAwesomeIcon icon={faSignOutAlt} />}
                                >
                                    <Link to="/logout">Đăng xuất</Link>
                                </Menu.Item>
                            </SubMenu>
                            <Menu.Item
                                key="1"
                                icon={<FontAwesomeIcon icon={faSeedling} />}
                            >
                                <Link to="/">Trạng thái vườn</Link>
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                icon={<FontAwesomeIcon icon={faChartBar} />}
                            >
                                <Link to="/statistic">Thống kê</Link>
                            </Menu.Item>
                            <Menu.Item
                                key="11"
                                icon={<FontAwesomeIcon icon={faDatabase} />}
                            >
                                <Link to="/record">Bảng dữ liệu</Link>
                            </Menu.Item>
                            <Menu.Item
                                key="10"
                                icon={<FontAwesomeIcon icon={faCogs} />}
                            >
                                <Link to="/control-panel">
                                    Trung tâm điều khiển
                                </Link>
                            </Menu.Item>
                            <Menu.Item
                                key="12"
                                icon={<ControlOutlined/>}
                            >
                                <Link to="/garden-control">
                                    Điều khiểm vườn
                                </Link>
                            </Menu.Item>
                            
                        </Menu>
                    </Sider>
                    <Layout className="site-layout">
                        <Header
                            className="site-layout-background"
                            style={{ padding: 0 }}
                        >
                            <div className="Header">
                                <FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes
                                Garden
                            </div>
                        </Header>
                        <Content style={{ margin: "0 16px" }}>
                            <div
                                className="site-layout-background"
                                style={{ padding: 24, minHeight: 360 }}
                            >
                                <Switch>
                                    <Suspense fallback={<h1>....</h1>}>
                                        <Route default exact path="/">
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
                                        <Route exact path="/logout">
                                            <Logout />
                                        </Route>
                                        <Route exact path="/user">
                                            <UserInfo />
                                        </Route>
                                    </Suspense>
                                </Switch>
                            </div>
                        </Content>
                        <Footer style={{ textAlign: "center" }}>
                            @ Smart Tomatoes Garden
                        </Footer>
                    </Layout>
                </Layout>
            </Router>
        </div>
    );
};

export default SiderDemo;
