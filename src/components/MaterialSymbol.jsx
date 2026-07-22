import PropTypes from 'prop-types';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import HubIcon from '@mui/icons-material/Hub';
import InventoryIcon from '@mui/icons-material/Inventory';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ICONS = {
  account_balance: AccountBalanceIcon,
  add: AddIcon,
  add_circle: AddCircleIcon,
  bar_chart: BarChartIcon,
  close: CloseIcon,
  dashboard: DashboardIcon,
  delete: DeleteIcon,
  donut_large: DonutLargeIcon,
  edit: EditIcon,
  expand_less: ExpandLessIcon,
  expand_more: ExpandMoreIcon,
  hub: HubIcon,
  inventory: InventoryIcon,
  inventory_2: Inventory2Icon,
  local_shipping: LocalShippingIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  monitoring: AnalyticsIcon,
  move_to_inbox: MoveToInboxIcon,
  notifications: NotificationsIcon,
  payments: PaymentsIcon,
  receipt_long: ReceiptLongIcon,
  search: SearchIcon,
  settings: SettingsIcon,
  shopping_cart: ShoppingCartIcon,
  sync_alt: SyncAltIcon,
  trending_up: TrendingUpIcon,
  visibility: VisibilityIcon,
};

export default function MaterialSymbol({ name, size = 20, color = 'inherit' }) {
  const SvgIcon = ICONS[name] || HelpOutlinedIcon;

  return <SvgIcon aria-hidden focusable="false" sx={{ fontSize: size, color, flexShrink: 0 }} />;
}

MaterialSymbol.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
};
