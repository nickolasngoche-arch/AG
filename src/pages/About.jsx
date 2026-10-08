import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="container narrow prose">
      <h1>About AgriGenius</h1>
      <p>
        AgriGenius is a digital marketplace for farmers and buyers in Nyanza, Kenya. Farmers list the produce they have,
        buyers advertise what they want to purchase, and both can check commodity prices in markets across Kisii, Nyamira,
        Kisumu, Siaya, Homa Bay and Migori before they trade.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li><strong>Farmers</strong> post produce with quantity, price, location and contact details.</li>
        <li><strong>Buyers</strong> post the produce they need, the quantity and the price they can pay.</li>
        <li><strong>Everyone</strong> can compare market prices to find the best place to sell or buy.</li>
      </ul>
      <h2>Why it matters</h2>
      <p>
        Many smallholder farmers sell without knowing current prices and rely on middlemen to find buyers. AgriGenius puts
        buyers, sellers and price information in one place so deals are fairer and quicker.
      </p>
      <Link className="btn btn-primary" to="/signup">Join AgriGenius</Link>
    </div>
  )
}
