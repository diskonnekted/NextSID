import type { Theme } from "../../types";
import Header from "./partials/header";
import Footer from "./partials/footer";
import Slider from "./partials/slider";
import Headline from "./partials/headline";
import Article from "./partials/article";
import Sidebar from "./partials/sidebar";
import Pagination from "./partials/pagination";
import konfigurasi from "./theme.config";
import tokens from "./tokens";
import FullContent from "./layouts/full-content";
import RightSidebar from "./layouts/right-sidebar";
import LeftSidebar from "./layouts/left-sidebar";

const theme: Theme = {
  key: "esensi",
  name: "Esensi",
  judul: "Esensi",
  versi: "1.0.0",
  deskripsi: "Tema editorial premium untuk portal informasi desa.",
  partials: {
    Header: Header as any,
    Footer: Footer as any,
    Slider: Slider as any,
    Headline: Headline as any,
    Article: Article as any,
    Sidebar: Sidebar as any,
    Pagination: Pagination as any,
  },
  layouts: {
    "full-content": FullContent,
    "right-sidebar": RightSidebar,
    "left-sidebar": LeftSidebar,
  },
  konfigurasi,
  tokens,
};

export default theme;
export { FullContent as fullContent, RightSidebar as rightSidebar, LeftSidebar as leftSidebar };
export { default as konfigurasiTema } from "./theme.config";
export { default as tokensTema } from "./tokens";