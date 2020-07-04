exports.page = {
    title: 'Input',
    blocks: [
        {
            type: 'heading2',
            value: 'Input'
        },
        {
            type: 'divider',
        },
        {
            type: 'heading3',
            value: 'Buttons'
        },
        {
            type: 'button',
            value: 'Success',
            attrs: {
                type: 'success'
            }
        },
        {
            type: 'button',
            value: 'Error',
            attrs: {
                type: 'error'
            }
        },
        {
            type: 'button',
            value: 'Warning',
            attrs: {
                type: 'warning'
            }
        },
        {
            type: 'button',
            value: 'Secondary',
            attrs: {
                type: 'secondary'
            }
        },
        {
            type: 'button',
            value: 'Text',
            attrs: {
                type: 'text'
            }
        },
        {
            type: 'button',
            value: 'Disabled',
            attrs: {
                disabled: true
            }
        },
        {
            type: 'heading4',
            value: 'Sizes'
        },
        {
            type: 'button',
            value: 'Small',
            attrs: {
                type: 'success',
                size: 'small'
            }
        },
        {
            type: 'button',
            value: 'Normal',
            attrs: {
                type: 'success',
                size: 'normal'
            }
        },
        {
            type: 'button',
            value: 'Large',
            attrs: {
                type: 'success',
                size: 'large'
            }
        },
        {
            type: 'divider',
        },
        {
            type: 'heading3',
            value: 'Input'
        },
        {
            type: 'input',
            attrs: {
                placeholder: 'Enter your name',
                label: 'Name',
                capitalize: 'characters'
            }
        },
        {
            type: 'input',
            value: '123456',
            attrs: {
                label: 'Password',
                secure: true
            }
        },
        {
            type: 'input',
            value: 'Disabled',
            attrs: {
                label: 'Status',
                disabled: true
            }
        },
        {
            type: 'heading4',
            value: 'Comment'
        },
        {
            type: 'input',
            attrs: {
                placeholder: 'Enter a comment',
                multiline: true
            }
        },
        {
            type: 'heading3',
            value: 'Select'
        },
        {
            type: 'singleselect',
            value: {
                items: [
                    'Rock',
                    'Scissor',
                    'Paper'
                ]
            },
            attrs: {
                label: 'Select a hand...'
            }
        },
        {
            type: 'multiselect',
            value: {
                items: [
                    'Hanoi',
                    'Cairo',
                    'Los Angeles',
                    'San Francisco',
                    'Paris'
                ]
            },
            attrs: {
                label: 'Select cities...'
            }
        },
        {
            type: 'switch',
            value: true,
            attrs: {
                label: 'Dark Mode'
            }
        },
        {
            type: 'divider',
        },
        {
            type: 'heading3',
            value: 'Date Picker'
        },
        {
            type: 'datepicker',
            attrs: {
                label: 'Pick a date and time range...',
                allowEndDate: true,
                allowTime: true
            }
        },
        {
            type: 'datepicker',
            attrs: {
                label: 'Pick a single date...',
                allowEndDate: false,
                allowTime: false
            }
        }
    ]
}