import React, { View, Component } from 'react';
import { Text } from 'react-native';

class DataUnit extends Component<{}> {

    constructor(props) {
        super(props); 
        this.state = {
            measurement: props.measurement,
            units: props.units
        }
        window.x = this;
    }

    ImpUnits = {
        feet: "ft",
        pounds: "lbs",
        fahrenheit: "F"
    };
    
    MetricUnits = {
        centimeters: "cm",
        kilograms: "kg",
        celsius: "C"
    };  

    convert() {
        switch(this.state.units) {
            case ImpUnits.feet:
                this.state.units = MetricUnits.centimeters;
                this.state.measurement *= 30.48;
                break;
            case ImpUnits.pounds:
                this.state.units = MetricUnits.kilograms;
                this.state.measurement *= 0.453592;
                break;
            case ImpUnits.fahrenheit:
                this.state.units = MetricUnits.celsius;
                this.state.measurement = (this.state.measurement - 32) * 5 / 9;
                break;
            case MetricUnits.centimeters:
                this.state.units = ImpUnits.feet;
                this.state.measurement *= 0.0328084;
                break;
            case MetricUnits.kilograms:
                this.state.units = ImpUnits.pounds;
                this.state.measurement *= 2.20462;
                break;
            case MetricUnits.celsius:
                this.state.units = ImpUnits.fahrenheit;
                this.state.measurement = (this.state.measurement * 5 / 9) + 32;
                break;
        }
    }

    render() {
        return(
            <View>
                <Text> {this.state.measurement} {this.state.units}</Text>
            </View>
        )
    }

}