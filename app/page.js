'use client';
import React from "react";
import Image from "next/image";
import localFont from "next/font/local";
import { MdCancel } from "react-icons/md";
import styles from './page.module.css'
import { FaWind, FaWater } from "react-icons/fa6";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [searchValue, setSearchValue] = React.useState('')
  const [inputFocused, setInputFocused] = React.useState(true)
  const [lastSearch, setLastSearch] = React.useState(new Set())
  const [weatherData, setWeatherData] = React.useState([])
  const [temperatureScale, setTemeperatureScale] = React.useState('C')
  
  async function fetchDatas(location) {
    const fetchedResponse = await fetch(`/api/forecast?location=${location.toLowerCase()}`)
    const fetchedDatas = await fetchedResponse.json()
    setWeatherData(() => fetchedDatas)
  }

  function SearchCallback(event) {
    event.preventDefault()
    const searchValue = event.target.search.value;
    setLastSearch((prev) => {
      const setValue = new Set([...prev, searchValue]);
      localStorage.setItem('lastSearch', JSON.stringify(setValue.keys().toArray()));
      setInputFocused(() => false)
      return setValue;
    });
    fetchDatas(searchValue)
  }

  function RemoveItem(item) {
    setLastSearch((prev) => {
      const setValue = new Set(prev.keys().toArray().filter(d => d != item));
      localStorage.setItem('lastSearch', JSON.stringify(setValue.keys().toArray()));
      return setValue;
    });
  }

  React.useEffect(() => {
    try {
      setLastSearch(new Set(JSON.parse(localStorage.getItem('lastSearch'))))
    } catch {
      localStorage.removeItem('lastSearch')
    }
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center p-4 gap-2.5"
    >
      <header
        className="flex flex-row gap-2 md:w-[60vw] w-full"
      >
        <Image
          width={45}
          height={45}
          alt="Weather Forecast App"
          src={'/favicon.png'}
          className="rounded-xl"
        />
        <form
          onSubmit={SearchCallback}
          className="flex w-full"
        >
          <input
            name="search"
            value={searchValue}
            onClick={() => setInputFocused(() => true)}
            onFocus={() => setInputFocused(() => true)}
            onChange={(event) => {setSearchValue(event.target.value); setInputFocused(() => true)}}
            placeholder="Enter the City Name or Zip Code"
            className={`${geistSans.className} border-0 px-4 text-gray-800 text-md font-medium rounded-2xl bg-slate-200 w-full outline-none`}
          />
        </form>
      </header>
      {((lastSearch.keys().toArray().filter(d => d.includes(searchValue)).length != 0) && inputFocused) &&
        <div
          className={`${geistSans.className} ${styles.searchBar} z-50 top-[5rem] max-h-[412px] overflow-auto flex flex-col absolute drop-shadow-2xl shadow-2xl border-2 border-gray-300 px-3 py-3 gap-2 text-black text-md rounded-2xl bg-slate-200 md:w-[58vw] w-full`}
        >
          {lastSearch.keys().toArray().reverse().filter(d => d.includes(searchValue)).map((sear, sear_index) => 
            <div
              key={sear_index}
              className="flex flex-row items-center justify-between w-full gap-1.5"
            >
              <button
                onClick={() => {setSearchValue(() => sear); setInputFocused(() => false); fetchDatas(sear)}}
                className="text-start text-gray-800 text-md font-medium w-full cursor-pointer p-2 px-3 rounded-xl bg-slate-300 drop-shadow-2xl border border-gray-200"
              >
                {sear}
              </button>
              <button
                onClick={() => RemoveItem(sear)}
                className="bg-[#dc3545] p-2 h-full rounded-xl"
              >
                <MdCancel
                  size={22}
                  color="#FFFFFF"
                />
              </button>
            </div>
          )}
        </div>
      }
      <main
        className="flex flex-col md:w-[60vw] w-full bg-slate-100 rounded-xl drop-shadow-lg min-h-[60vh] py-2"
      >
        <div
          className={`flex flex-row gap-6 w-full items-center text-black font-medium text-md px-8 py-2.5 border-b-2 border-b-gray-200 ${geistSans.className}`}
        >
          <span
            className="min-w-[6em]"
          >
            Time
          </span>
          <span
            className="min-w-[8em] flex flex-row gap-0.5"
          >
            ° Celcius
          </span>
          <span
            className="flex-1 flex flex-row gap-2 items-center capitalize"
          >
            Weather Condition
          </span>
          <div
            className="flex flex-row gap-12 w-[15em] justify-between"
          >
            <span
              className="flex flex-row gap-4 items-center justify-center"
            >
              Wind Speed
            </span>
            <span
              className="flex-1 flex flex-row gap-4 items-center justify-center"
            >
              Precipitation
            </span>
          </div>
        </div>
        {weatherData.map((data, data_i) =>
          <div
            className={`flex flex-row gap-6 w-full items-center text-black text-md px-8 py-2.5 ${((data_i+1) == weatherData.length) ? '' : 'border-b-2'} border-b-gray-200 ${geistSans.className}`}
          >
            <span
              className="min-w-[6em] text-slate-800 text-md"
            >
              {(new Date().getDate() == new Date(data.date).getDate()) ?
                'Today'
                :
                new Date(data.date).toLocaleDateString("en-us", { month: 'short', day: '2-digit' })
              }
            </span>
            <span
              className="min-w-[8em] flex flex-row gap-0.5 text-black/80"
            >
              <span
                className="text-xl font-medium"
              >
                {(temperatureScale == 'C') ? data.maxtemp_c : data.maxtemp_f}°
              </span>
              /
              <span
                className="text-sm mt-0.5"
              >
                {(temperatureScale == 'C') ? data.mintemp_c : data.mintemp_f}°
              </span>
            </span>
            <span
              className="flex-1 flex flex-row gap-2 items-center text-sm capitalize"
            >
              <img src={`https:${data.icon}`} width={30} height={30} /> {data.text}
            </span>
            <div
              className="flex flex-row gap-12 w-[15em] justify-between"
            >
              <span
                className="flex flex-row gap-4 items-center justify-center"
              >
                <FaWind
                  className="text-sky-600"
                /> 
                <span
                  className="opacity-85"
                >
                  {data.maxwind_kph} <span className="text-sm">Km/Hr</span>
                </span>
              </span>
              <span
                className="flex flex-row gap-4 items-center justify-center"
              >
                <FaWater
                  className="text-sky-600"
                /> 
                <span
                  className="opacity-85"
                >
                  {data.avghumidity} <span className="text-sm">MM</span>
                </span>
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
