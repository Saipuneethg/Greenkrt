async function check() {
  const res = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Guntur&appid=523250a69a2145b79e951728261806&units=metric')
  const text = await res.text()
  console.log(res.status, text)
}
check()
