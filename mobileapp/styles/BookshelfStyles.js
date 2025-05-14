import { StyleSheet } from "react-native";

export const BookshelfStyles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    backgroundColor: "#fff"
  },
  
  searchBarContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 15
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },

  iconButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  profileButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7d819f",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButtonText: {color: "#fff", fontSize: 16},

  heading: {fontSize: 20, fontWeight: "bold", marginVertical: 10, paddingHorizontal: 10},

  searchResultContainer: {flex: 1},
  searchItem: {flex: 1, padding: 8, marginBottom: 20, alignItems: "center"},

  card: {
    width: '30%',
    margin: "1.5%",
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    },
    cover: {
        width: '100%',
        height: 150,
    },
    coverImage: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    cardContent: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 18,
    },

    fab: {
        position: "absolute",
        right: 30,
        bottom: 40,
        backgroundColor: "#7d819f",
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    fabText: {color: "#fff", fontSize: 30, marginTop: -6},

    modalView: {
        marginTop: "60%",
        marginHorizontal: 20,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 2},
        elevation: 5,
    },
    modalTitle: {fontSize: 18, fontWeight: "bold", marginBottom: 10},
    modalButtons: {flexDirection: "row", justifyContent: "space-between"},
    button: {backgroundColor: "#7d819f", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10},
    cancel: {backgroundColor: "#ccc"},
    buttonText: {color: "#fff", fontSize: 16},

    cameraContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    closeScanner: {
        position: "absolute",
        top: 40,
        left: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 6,
    },
    closeText: {color: "#fff", fontSize: 16},
    scannerHelper: {
        transform: [
            { scaleX: 1.5},
            { scaleY: 1.2 }
        ]
    },
    dropdown: {
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 15,
    },
    placeholderStyle: {
      fontSize: 16,
      color: '#999',
    },
    selectedTextStyle: {
      fontSize: 16,
      color: '#333',
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },		
});
