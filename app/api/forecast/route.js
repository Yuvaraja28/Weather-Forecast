import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request) {
  const search_query = new URL(request.nextUrl).searchParams
  const location = search_query.get('location');
  if (location == null) {
    return NextResponse.json([])
  }
  const sql = postgres({
    host : process.env.PG_HOST,
    port : process.env.PG_PORT,
    database : process.env.PG_DATABASE,
    username : process.env.PG_USER,
    password : process.env.PG_PASS
  })
  try {
    const fetchedResponse = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${location}&days=10&aqi=no&alerts=no`)
    const fetchedDatas = await fetchedResponse.json()
    const finalDatas = fetchedDatas.forecast.forecastday.map(d => ({date: d.date, ...d.day, ...d.day.condition}));
    await sql`DROP TABLE ${sql(location)};`.execute().catch(() => {console.log("Table doesnt Exist")});
    await sql`CREATE TABLE ${sql(location)} (
      date varchar,
      maxtemp_c varchar,
      mintemp_c varchar,
      maxtemp_f varchar,
      mintemp_f varchar,
      maxwind_kph varchar,
      totalprecip_mm varchar,
      avghumidity varchar,
      text varchar,
      icon varchar
    );`.execute().catch(() => "Failed to create the Table");
    for (const data in finalDatas) {
      await sql`INSERT INTO ${sql(location)} (
        date,
        maxtemp_c,
        mintemp_c,
        maxtemp_f,
        mintemp_f,
        maxwind_kph,
        totalprecip_mm,
        avghumidity,
        text,
        icon
      )
      VALUES (
        ${(finalDatas[data].date)},
        ${(finalDatas[data].maxtemp_c)},
        ${(finalDatas[data].mintemp_c)},
        ${(finalDatas[data].maxtemp_f)},
        ${(finalDatas[data].mintemp_f)},
        ${(finalDatas[data].maxwind_kph)},
        ${(finalDatas[data].totalprecip_mm)},
        ${(finalDatas[data].avghumidity)},        
        ${(finalDatas[data].text)},
        ${(finalDatas[data].icon)}
      );`.execute().catch(() => "Failed to insert Data into the Table");
    }
  } catch {}
  const databaseDatas = []
  await sql`SELECT * FROM ${sql(location)};`.cursor(async([row]) => {
    databaseDatas.push(row)
  }).catch(() => "Failed to Query datas from the Table")
  return NextResponse.json(databaseDatas);
}