import * as React from "react";
import { Button, Checkbox } from 'antd';

export interface HelloProps { compiler: string; framework: string; }

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class Hello extends React.Component<HelloProps, {}> {
	onChange = () => {
  		console.log(`checked`);
	}

    render() {
        return (
        	<div>
        		<Button type="primary">Primary</Button>
        		<Checkbox onChange={this.onChange}>Checkbox</Checkbox>
        		<h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
        	</div>
        )
    }
}