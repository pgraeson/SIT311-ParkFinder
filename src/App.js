import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import NewMarker from './NewMarker.js'
import './App.css';

const fetch=require("node-fetch");
const places=require('places.js');

class App extends React.Component{
	
	state = {
		status : "ALL",
		events: [],
		lat: "0",
		lng: "0",
		distance: "500",
		hover: false,
		markerName: ""
	}
	
	statusChanged = (e) => {
		this.setState({status:e.target.value},this.fetchParking);
	}
	
	fetchParking = () => {
		let url = 'https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?';
		if(this.state.status!=='ALL'){
			url+=`status=${this.state.status}&`
		}
		if(this.state.lat!=='0'){
			url+=`$where=within_circle(location,${this.state.lat},${this.state.lng},${this.state.distance})&`;
		}
		url+='$limit=10';
		fetch(url)
			.then(response => response.json())
			.then(data => {
				this.sortParking(data)
			})
			.catch(error=> {
				
			});
	}
	
	fetchRestriction = ( id ) => {
		let url= `https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${id}`;
		fetch(url)
			.then(response => response.json())
			.catch(error => {
				
			});
	}
	
	sortParking = ( data ) => {
		var arr =[];
		for (let index in data) {
			const json = {
				Bay_ID: data[index].bay_id,
				Location: {
					Latitude: data[index].lat,
					Longitude: data[index].lon
				},
				Status: data[index].status
			};
			arr.push(json);
		}
		console.log(arr);
		this.setState({events: arr})
	}
	
	componentDidMount(){
		this.fetchParking();
		var placesAutoComplete = places({
			appId: 'plY0BYIMLL9G',
			apiKey: 'f14232e9f94d077e60d8007c1b05c5bb',
			container: document.querySelector('#address'),
			type: 'address'
		});
		placesAutoComplete.on('change', e => {
			this.setState({lat: e.suggestion.latlng.lat ,lng: e.suggestion.latlng.lng}, this.fetchParking);
			console.log(JSON.stringify(e.suggestion.latlng.lat))
		});
	}
	
	sliderChange(e){
		let obj = {};
		obj[e.target.name] = e.target.value;
		console.log(JSON.stringify(obj));
		this.setState(obj);
	}
	
	handleClick = ({event, payload, name, anchor}) => {
		console.log(`Marker #${JSON.stringify(payload)} clicked at: `, anchor);
		this.setState({selectedIcon: payload})
	}
	
	handleMouseOver = ({ event, name }) => {
		this.setState({ hover: true , markerName: name})
	}
	
	handleMouseOut = ({ event, name }) => {
		this.setState({ hover: false })
	}
	
	render() {
		const status = ['ALL', 'Present', 'Unoccupied', ]
		
		const tooltipStyle = {
			display: this.state.hover ? 'block' : 'none',
			borderColor: "white",
			borderWidth: "thick",
			borderStyle: "solid",
			background: "black"
		}
		
		return (
			<div className="App">
				<input type="search" id="address" className="form-control" placeholder="Where are we going?" />
				<div className="slidecontainer">
					<input type="range" min="1" max="1000" name='distance' value={this.state.distance} className="slider" id="myRange" onChange={(e) => {this.sliderChange(e)}}/>
				</div>
				
				<header className="App-header">
					<Map center={[-37.8470585,145.1145445]} zoom={12} width={600} height={400} >
						<Marker anchor={[-37.8470585,145.1145445]} payload={1} onClick={this.handleClick} />
						{this.state.events.map(i=> (<NewMarker anchor={[parseFloat(i.Location.Latitude),parseFloat(i.Location.Longitude)]} status={i.Status} key={i.Bay_ID} name={i.Bay_ID} payload={i} onClick={this.handleClick} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}/>))}
						<div>
							<div style={tooltipStyle} className="tooltip" >{this.state.markerName}</div>
						</div>
					</Map>
					
					<label>Status</label>
					<select onChange={this.statusChanged} value={this.state.status}>
						{status.map(i=>(<option key={i} value={i}>{i}</option>))}
					</select>
				</header>
			</div>
		)
	}
}

export default App;