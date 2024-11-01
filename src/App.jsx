import Home from "./components/Home";
global.Buffer = global.Buffer || require('buffer').Buffer;

function App() {
  return (
    <>
      <Home />
    </>
  )
}

export default App