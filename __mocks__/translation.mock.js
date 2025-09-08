import React from 'react';

const replaceValue = (text, values) => {
    return text.replace(/{{(\w+)}}/g, (match, key) => {
        // If the value is an empty string, return an empty fragment to render nothing
        if (values[key] === '') {
            return '';
        }
        return values[key] || match;
    });
};

const Localize = ({ i18n_default_text, components = [], values = {} }) => {
    if (!i18n_default_text) return null;

    // For simple cases with no components or complex processing, return the text directly
    if (components.length === 0 && Object.keys(values).length === 0) {
        return i18n_default_text;
    }

    let processedText = i18n_default_text;
    const elementsToRender = [];
    let elementIndex = 0;

    // First, handle value placeholders
    processedText = replaceValue(processedText, values);

    // Then handle opening/closing tags like <0>text</0>
    processedText = processedText.replace(/<(\d+)>(.*?)<\/\1>/g, (match, index, content) => {
        const componentIndex = parseInt(index);
        const Component = components[componentIndex];

        if (Component && React.isValidElement(Component)) {
            // Clone the component with the content as children, preserving all original props
            const clonedComponent = React.cloneElement(Component, {
                key: elementIndex,
                children: content,
            });
            elementsToRender.push(clonedComponent);
            return `__ELEMENT_${elementIndex++}__`;
        }

        return content;
    });

    // Handle self-closing tags like <0/>
    processedText = processedText.replace(/<(\d+)\/>/g, (match, index) => {
        const componentIndex = parseInt(index);
        const Component = components[componentIndex];

        if (Component && React.isValidElement(Component)) {
            const clonedComponent = React.cloneElement(Component, {
                key: elementIndex,
            });
            elementsToRender.push(clonedComponent);
            return `__ELEMENT_${elementIndex++}__`;
        }

        return '';
    });

    // Split the text by element placeholders and reconstruct with React elements
    const textParts = processedText.split(/(__ELEMENT_\d+__)/g);
    const finalElements = [];

    textParts.forEach(part => {
        const elementMatch = part.match(/__ELEMENT_(\d+)__/);
        if (elementMatch) {
            const elementIdx = parseInt(elementMatch[1]);
            finalElements.push(elementsToRender[elementIdx]);
        } else if (part) {
            finalElements.push(part);
        }
    });

    return React.createElement(React.Fragment, null, ...finalElements);
};

const mockFn = jest.fn((text, args) => {
    return text.replace(/{{(.*?)}}/g, (_, match) => args[match.trim()]);
});

// Mock for useTranslations hook
const useTranslations = () => ({
    localize: mockFn,
    currentLang: 'EN',
});

const localize = mockFn;

const getAllowedLanguages = jest.fn(() => {
    return { EN: 'English', VI: 'Tiếng Việt' };
});

const getInitialLanguage = jest.fn(() => 'EN');

export { Localize, localize, useTranslations, getAllowedLanguages, getInitialLanguage };
