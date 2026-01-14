// Lista completa de iconos disponibles de Lucide React
export const ICONS = [
  // Acciones básicas
  "Plus",
  "Minus",
  "X",
  "Check",
  "ChevronDown",
  "ChevronUp",
  "ChevronLeft",
  "ChevronRight",
  "ChevronsDown",
  "ChevronsUp",
  "ChevronsLeft",
  "ChevronsRight",
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUpRight",
  "ArrowDownRight",
  "ArrowUpLeft",
  "ArrowDownLeft",

  // Navegación y UI
  "Menu",
  "MoreVertical",
  "MoreHorizontal",
  "Settings",
  "Search",
  "Filter",
  "Home",
  "Grid",
  "List",
  "Layers",
  "Layout",
  "Sidebar",
  "PanelLeft",
  "PanelRight",
  "Maximize",
  "Minimize",
  "ZoomIn",
  "ZoomOut",

  // Archivos y documentos
  "File",
  "FileText",
  "Files",
  "Folder",
  "FolderOpen",
  "Upload",
  "Download",
  "Save",
  "Trash",
  "Archive",
  "Copy",
  "Clipboard",
  "ClipboardList",
  "FileEdit",
  "FilePlus",
  "FolderPlus",

  // Comunicación
  "Mail",
  "MessageSquare",
  "MessageCircle",
  "Phone",
  "PhoneCall",
  "Send",
  "Share",
  "Bell",
  "BellOff",

  // Usuarios y personas
  "User",
  "Users",
  "UserPlus",
  "UserMinus",
  "UserCheck",
  "UserX",
  "Contact",

  // Estado y notificaciones
  "AlertCircle",
  "AlertTriangle",
  "Info",
  "HelpCircle",
  "CheckCircle",
  "XCircle",
  "AlertOctagon",
  "ShieldAlert",

  // Tiempo y calendario
  "Calendar",
  "Clock",
  "Timer",
  "CalendarDays",
  "CalendarCheck",

  // Edición y formato
  "Edit",
  "Edit2",
  "Edit3",
  "Pen",
  "Pencil",
  "Type",
  "Bold",
  "Italic",
  "Underline",

  // Medios
  "Image",
  "Video",
  "Camera",
  "Music",
  "PlayCircle",
  "Play",
  "Pause",
  "Volume2",
  "VolumeX",

  // Comercio
  "ShoppingCart",
  "ShoppingBag",
  "CreditCard",
  "DollarSign",
  "Euro",
  "Tag",
  "Percent",

  // Negocios y oficina
  "Briefcase",
  "Building",
  "Building2",
  "Factory",
  "Store",
  "Warehouse",
  "Package",
  "Boxes",
  "Truck",

  // Datos y estadísticas
  "BarChart",
  "BarChart2",
  "BarChart3",
  "LineChart",
  "PieChart",
  "TrendingUp",
  "TrendingDown",
  "Activity",

  // Tecnología
  "Cpu",
  "Database",
  "Server",
  "HardDrive",
  "Wifi",
  "WifiOff",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Laptop",

  // Seguridad
  "Lock",
  "Unlock",
  "Key",
  "Shield",
  "ShieldCheck",
  "Eye",
  "EyeOff",

  // Herramientas
  "Wrench",
  "Tool",
  "Hammer",
  "Paintbrush",
  "Scissors",

  // Mapas y ubicación
  "Map",
  "MapPin",
  "Navigation",
  "Compass",
  "Globe",

  // Tiempo atmosférico
  "Sun",
  "Moon",
  "Cloud",
  "CloudRain",
  "CloudSnow",
  "Zap",

  // Objetos
  "Heart",
  "Star",
  "Flag",
  "Bookmark",
  "Award",
  "Gift",
  "Trophy",
  "Target",

  // Transporte
  "Car",
  "Bus",
  "Bike",
  "Plane",
  "Ship",

  // Naturaleza
  "Leaf",
  "Flower",
  "Tree",

  // Comida y bebida
  "Coffee",
  "Pizza",
  "Wine",

  // Deportes
  "Dumbbell",
  "Gamepad",

  // Conectividad
  "Link",
  "Unlink",
  "Bluetooth",
  "Radio",

  // Gestión
  "ClipboardCheck",
  "ClipboardX",
  "ListChecks",
  "SquareCheck",

  // Organización
  "Folder",
  "FolderTree",
  "BookOpen",
  "Book",
  "Library",

  // Redes sociales
  "ThumbsUp",
  "ThumbsDown",
  "Share2",

  // Desarrollo
  "Code",
  "Code2",
  "Terminal",
  "GitBranch",
  "GitCommit",
  "GitMerge",
  "Bug",

  // Power y control
  "Power",
  "PowerOff",
  "Loader",
  "Loader2",
  "RefreshCw",
  "RotateCw",
  "RotateCcw",

  // Emociones
  "Smile",
  "Frown",
  "Meh",

  // Varios
  "Lightbulb",
  "Flame",
  "Droplet",
  "Wind",
  "Feather",
  "Anchor",
  "Rocket",
  "Sparkles",
  "Crown",
  "Gem",
  "BadgeCheck",
  "CircleDot",
  "Square",
  "Circle",
  "Triangle",
  "Hexagon",
] as const;

export type IconName = (typeof ICONS)[number];
