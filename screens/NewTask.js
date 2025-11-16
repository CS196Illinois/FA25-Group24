import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity, Picker, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

export default function NewTask() {
    //state , functions, handlers, cariables for importance scale
    const [importance, setImportance] = useState(3);
    //state , functions, handlers, cariables for importance scale

    //state , functions, handlers, cariables for date and time picker
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    
    const showDatePickerModal = () => { 
        setShowDatePicker(true);
    };
    
    const showTimePickerModal = () => { 
        setShowTimePicker(true);
    };
    
    const handleDateChange = (event) => {
        const selectedDate = new Date(event.nativeEvent.timestamp);
        setDate(selectedDate);
        setShowDatePicker(false);
    };
    
    const handleTimeChange = (event) => {
        const selectedDate = new Date(event.nativeEvent.timestamp);
        setDate(selectedDate);
        setShowTimePicker(false);
    };
    //state , functions, handlers, cariables for date and time picker
    
    //state , functions, handlers, cariables for label selection
    const [labels, setLabels] = useState([
        { id: 1, name: "RSOS", color: "#FF6347" },
        { id: 2, name: "Study", color: "#51CF66" },
        { id: 3, name: "Physical and mental well being", color: "#FFD93D" }
    ]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const currentLabel = labels.find(label => label.id === selectedLabel);
    const [showNewLabelForm, setShowNewLabelForm] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#FF6347");
    const addNewLabel = () => {
         if (newLabelName.trim() === "") return; 
         const newLabel = {
            id: Date.now(), // Use timestamp as unique ID
            name: newLabelName,
            color: newLabelColor
        };
        setLabels([...labels, newLabel]); 
        setNewLabelName(""); 
        setShowNewLabelForm(false); 
    };
    const deleteLabel = (labelId) => {
        setLabels(labels.filter(label => label.id !== labelId));
        if (selectedLabel === labelId) {
            setSelectedLabel(null); // Deselect if deleted label was selected
        }
    };
    //state , functions, handlers, cariables for label selection
    //DIFFICULTY LEVEL CODE START
        const [difficulty, setDifficulty] = useState(3);
    //DIFFICULTY LEVEL CODE END

    //state for options menu
    const [showOptions, setShowOptions] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header with back button and options */}
            <View style={styles.header}>
                <Pressable style={styles.circleButton} onPress={() => { /* Navigate back */ }}>
                    <Text style={styles.backArrow}>←</Text>
                </Pressable>
                
                <Text style={styles.title}>New Task</Text>
                
                <Pressable style={styles.circleButton} onPress={() => setShowOptions(!showOptions)}>
                    <Text style={styles.dotsMenu}>⋯</Text>
                </Pressable>
            </View>

            {/* Options dropdown */}
            {showOptions && (
                <View style={styles.optionsDropdown}>
                    <Pressable 
                        style={styles.optionItem}
                        onPress={() => {
                            // Delete task logic here
                            setShowOptions(false);
                        }}
                    >
                        <Text style={styles.deleteOptionText}>Delete Task</Text>
                    </Pressable>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Task Title</Text>
                <TextInput style={styles.input} placeholder="Enter task title"/>
                
                <Text style={styles.label}>Due Date</Text>
                <View style={styles.dateTimeRow}>
                    <Pressable style={styles.dateTimeBox} onPress={showDatePickerModal}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </Pressable>
                    
                    <Pressable style={styles.dateTimeBox} onPress={showTimePickerModal}>
                        <Text style={styles.dateText}>{formattedTime}</Text>
                    </Pressable>
                </View>
                
                {showDatePicker && (
                    <DateTimePicker 
                        value={date}
                        mode="date"
                        onChange={handleDateChange}
                    />
                )}
                
                {showTimePicker && (
                    <View style = {styles.timePickerWrappper}>
                        <DateTimePicker 
                            value={date}
                            mode="time"
                            onChange={handleTimeChange}
                        />
                    </View>
                )}
                <Text style={styles.label}>Importance Scale</Text>
                <Text style={styles.sliderlabel}></Text>
                <View style={styles.slider12345Container}>
                    <Text style={styles.sliderLabelIcon}>              </Text>
                    <Text style={styles.sliderLabel}>1</Text>
                    <Text style={styles.sliderLabelIcon}>                   </Text>
                    <Text style={styles.sliderLabel}>2</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabel}>3</Text>
                    <Text style={styles.sliderLabelIcon}>                   </Text>
                    <Text style={styles.sliderLabel}>4</Text>
                    <Text style={styles.sliderLabel}>           </Text>
                    <Text style={styles.sliderLabel}>5</Text>
                </View>
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabelIcon}>              </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                 </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                </View>
                <View style={styles.sliderContainer}>
                        <Text style={styles.sliderIcon}>🐢</Text>
        
                    <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={5}
                            step={1}
                            value={importance}
                            onValueChange={setImportance}
                            minimumTrackTintColor="#8B7DD8"
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor="#8B7DD8"
                    />
                        <Text style={styles.sliderIcon}>🐰</Text>
                </View>


                {/* LABEL PICKER CODE */}
                <Text style={styles.label}>Label</Text>
                <Pressable 
                    style={styles.labelBox} 
                    onPress={() => setShowLabelPicker(!showLabelPicker)}
                >
                    {currentLabel ? (
                        <View style={styles.labelContent}>
                            <View style={[styles.colorDot, { backgroundColor: currentLabel.color }]} />
                            <Text style={styles.labelText}>{currentLabel.name}</Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholderText}>Select Label</Text>
                    )}
                    <Text style={styles.dropdownArrow}>▼</Text>
                </Pressable>
                {showLabelPicker && (
                    <View style={styles.labelDropdown}>
                        {labels.map((label) => (
                            <View key={label.id} style={styles.labelOptionContainer}>
                                <Pressable
                                    key={label.id}
                                    style={styles.labelOption}
                                    onPress={() => {
                                        setSelectedLabel(label.id);
                                        setShowLabelPicker(false);
                                }}
                            >
                                    <View style={[styles.colorDot, { backgroundColor: label.color }]} />
                                    <Text style={styles.labelText}>{label.name}</Text>
                                </Pressable>
                                {/* Delete button */}
                                <Pressable 
                                    style={styles.deleteButton}
                                    onPress={() => deleteLabel(label.id)}
                            >
                                    <Text style={styles.deleteButtonText}>✕</Text>
                                </Pressable>
                            </View>
                        ))}
                           
                        {/* Add new label button */}
                        <Pressable 
                            style={styles.addLabelButton}
                            onPress={() => setShowNewLabelForm(!showNewLabelForm)}
                        >
                            <Text style={styles.addLabelButtonText}>+ Add New Label</Text>
                        </Pressable>
                        
                        {/* New label form */}
                        {showNewLabelForm && (
                            <View style={styles.newLabelForm}>
                                <TextInput
                                    style={styles.newLabelInput}
                                    placeholder="Label name"
                                    value={newLabelName}
                                    onChangeText={setNewLabelName}
                                />
                                
                                {/* Color picker - simple version with preset colors */}
                                <View style={styles.colorPicker}>
                                    {['#FF6347', '#51CF66', '#FFD93D', '#4DABF7', '#9775FA', '#FF8787'].map((color) => (
                                        <Pressable
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                newLabelColor === color && styles.selectedColorOption
                                            ]}
                                            onPress={() => setNewLabelColor(color)}
                                        />
                                    ))}
                                </View>
                                
                                <Pressable style={styles.saveButton} onPress={addNewLabel}>
                                    <Text style={styles.saveButtonText}>Save Label</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
                {/* LABEL PICKER CODE END */}

                {/* DIFFICULTY LEVEL CODE START */}
                <Text style={styles.label}>Difficulty level</Text>
                        <Text style={styles.sliderlabel}></Text>
                <View style={styles.slider12345Container}>
                    <Text style={styles.sliderLabelIcon}>              </Text>
                    <Text style={styles.sliderLabel}>1</Text>
                    <Text style={styles.sliderLabelIcon}>                   </Text>
                    <Text style={styles.sliderLabel}>2</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabel}>3</Text>
                    <Text style={styles.sliderLabelIcon}>                   </Text>
                    <Text style={styles.sliderLabel}>4</Text>
                    <Text style={styles.sliderLabel}>           </Text>
                    <Text style={styles.sliderLabel}>5</Text>
                </View>
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabelIcon}>              </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                 </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                    <Text style={styles.sliderLabelIcon}>                  </Text>
                    <Text style={styles.sliderLabelIcon}>⚪</Text>
                </View>
                <View style={styles.sliderContainer}>
                        <Text style={styles.sliderIcon}>🐢</Text>
        
                    <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={5}
                            step={1}
                            value={difficulty}
                            onValueChange={setDifficulty}
                            minimumTrackTintColor="#8B7DD8"
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor="#8B7DD8"
                    />
                        <Text style={styles.sliderIcon}>🐰</Text>
                </View>
                {/* DIFFICULTY LEVEL CODE END */}
                <Text style={styles.label}>Approximate Time Required</Text>
                <TextInput style={styles.input} placeholder="Enter Approximate time required"/>
                <Text style={styles.label}>Additional Notes</Text>
                <TextInput style={styles.input} placeholder="Enter any additional notes"/>

                <View style={[styles.dateTimeRow, {marginTop: 20, marginBottom: 20}]}>
                    <Pressable style={[styles.dateTimeBox, { backgroundColor: '#8B7DD8' }]} onPress={() => { /* Save task action */ }}>
                        <Text style={[styles.label, {textAlign: 'center'}, {marginTop: 5}]}>Save Task</Text>
                    </Pressable>
                    
                    <Pressable style={[styles.dateTimeBox, { backgroundColor: '#8B7DD8' }]} onPress={() => { /* Save task action */ }}>
                        <Text style={[styles.label, {textAlign: 'center'}, {marginTop: 5}]}>Cancel</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#7f7f7fff',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    circleButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backArrow: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    dotsMenu: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    optionsDropdown: {
        position: 'absolute',
        top: 100,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    optionItem: {
        padding: 12,
    },
    deleteOptionText: {
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: '500',
    },
    title: {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 1,
        fontWeight: '500',
    },
    input: {
        padding: 11,
        borderRadius: 25,
        fontSize: 16,
        backgroundColor: '#F8F8F8',
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    dateTimeBox: {
        flex: 1,
        padding: 11,
        borderRadius: 25,
        fontSize: 16,
        backgroundColor: '#F8F8F8',
    },
    dateText: {
        fontSize: 16,
        color: '#000',
    },
    timePickerWrappper: {
       marginLeft: '50%',
    },
    slider: {
    width: '85%',
    height: 13,
    },
    sliderlabel: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 6,
        fontWeight: '500',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 3,
        marginBottom: 2,
    },
    slider12345Container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: -19,
        marginBottom: 2,
    },
    sliderIcon: {
        fontSize: 15,
    },
    sliderLabelIcon: {
        fontSize: 7,
    },
    sliderLabel: {
        fontSize: 14,
    },
    labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 11,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
},
labelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
},
colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
},
labelText: {
    fontSize: 16,
    color: '#000',
},
placeholderText: {
    fontSize: 16,
    color: '#999',
},
dropdownArrow: {
    fontSize: 12,
    color: '#666',
},
labelDropdown: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginTop: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
labelOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
},
labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderRadius: 10,
    flex: 1,
},
deleteButton: {
    padding: 8,
},
deleteButtonText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: 'bold',
},
addLabelButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 5,
},
addLabelButtonText: {
    fontSize: 16,
    color: '#8B7DD8',
    fontWeight: '500',
},
newLabelForm: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 5,
},
newLabelInput: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    fontSize: 16,
    marginBottom: 10,
},
colorPicker: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
},
colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
},
selectedColorOption: {
    borderColor: '#000',
    borderWidth: 3,
},
saveButton: {
    backgroundColor: '#8B7DD8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
},
saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
},
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
    timeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
    timeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
    modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
    modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
    pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
    pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
    pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
    picker: {
    width: 100,
    height: 150,
  },
    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

});