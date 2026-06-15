import { MapThemeSwitcher } from "../map/MapThemeSwitcher";

const nav = [
  { title: "Map", page: "/" },
  { title: "About", page: "/about" },
  { title: "Community", page: "/community" }
];

export function NavBar() {
  return (
    // <div className="absolute lg:bottom-238 h-fit z-2000 sm:left-1/2 sm:-translate-x-1/2 sm:w-220 lg:w-450 text-black list-none flex flex-row justify-between px-2 items-baseline">
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 bg-white px-4 py-2 flex flex-col gap-2 justify-center  sm:relative sm:flex-row sm:justify-between sm:px-2 sm:items-baseline">
      <h1 className="text-4xl">TObikethefts</h1>
      <div className="flex gap-4 justify-center sm:-translate-y-0.5 items-center">
        {nav.map((page) => {
          return (
            <div
              key={page.title}
              className="group sm:w-25  flex flex-col items-center"
            >
              <a href={page.page} className="flex justify-center">
                {page.title}
              </a>
              <div className="not-group-hover:border-white border-b border-black w-1/3" />
            </div>
          );
        })}
        <MapThemeSwitcher className="h-8 aspect-square ml-4 hover:bg-slate-300 flex justify-center p-2 rounded shadow-lg" />
      </div>
    </div>
  );
}
