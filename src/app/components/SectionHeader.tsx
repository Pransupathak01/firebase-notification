import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const styles = StyleSheet.create({
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginLeft: 24,
        marginBottom: 10,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default SectionHeader;
