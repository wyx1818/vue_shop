import Vue from 'vue'
import {
  Row, Col,
  Button, Form, FormItem, Input, Message, Container, Header,
  Aside, Main, Menu, Submenu, MenuItem, MenuItemGroup,
  Breadcrumb, BreadcrumbItem, Card, Table, TableColumn, Switch, Tooltip,
  Pagination, Dialog, MessageBox
} from 'element-ui'

Vue.use(Row)
Vue.use(Col)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

Vue.prototype.$message = Message // 挂载到原型上
Vue.prototype.$confirm = MessageBox.confirm // 挂载到原型上
