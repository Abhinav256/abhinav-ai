async function listModels() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        "x-goog-api-key": "AIzaSyCmPAjR44xUdUw8Oo6pd2uQVRK6hkHO9Pk",
      },
    }
  )

  const data = await res.json()
  console.log(data)
}

listModels()