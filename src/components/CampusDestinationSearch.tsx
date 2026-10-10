type Prediction = { place_id: string; name: string; address: string };

async function post(path: string, payload: object) {
  const res = await fetch(`${API_URL}/api/places/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// inside the component:
const [predictions, setPredictions] = useState<Prediction[]>([]);
const sessionToken = useRef(Math.random().toString(36).slice(2)); // or crypto.randomUUID()

useEffect(() => {
  if (!API_URL || trimmed.length < 2) { setPredictions([]); return; }
  const t = setTimeout(async () => {          // debounce: wait 300ms after typing stops
    try {
      const data = await post("autocomplete", { query: trimmed, session_token: sessionToken.current });
      setPredictions(data.predictions ?? []);
    } catch { setPredictions([]); }
  }, 300);
  return () => clearTimeout(t);
}, [trimmed]);

async function choosePrediction(p: Prediction) {
  try {
    const d = await post("details", { place_id: p.place_id, session_token: sessionToken.current });
    sessionToken.current = Math.random().toString(36).slice(2); // new session after a selection
    choose({ place_id: d.place_id, name: d.name, address: d.address, latitude: d.latitude, longitude: d.longitude });
  } catch { setAi({ state: "error" }); }
}
