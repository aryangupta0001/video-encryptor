import {
  BrowserRouter as Router
} from "react-router-dom";

import Home from "./components/Home";
import ChunkState from "./context/ChunkState";


function App() {
  return (
    <>
      <ChunkState>
        <Router>
            <Home />
        </Router>
      </ChunkState>
    </>
  )
}

export default App