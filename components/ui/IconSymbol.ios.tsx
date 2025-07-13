import React, { Component } from 'react';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

interface IconSymbolProps {
    name: SymbolViewProps['name'];
    size?: number;
    color: string;
    style?: StyleProp<ViewStyle>;
    weight?: SymbolWeight;
}

class IconSymbol extends Component<IconSymbolProps> {
    static defaultProps = {
        size: 24,
        weight: 'regular' as SymbolWeight,
    };

    render() {
        const { name, size, color, style, weight } = this.props;

        return (
            <SymbolView
                weight={weight}
                tintColor={color}
                resizeMode="scaleAspectFit"
                name={name}
                style={[
                    {
                        width: size,
                        height: size,
                    },
                    style,
                ]}
            />
        );
    }
}

export default IconSymbol;
