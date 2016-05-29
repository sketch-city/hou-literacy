import pandas as pd
clean_data = pd.read_csv("clean_data.csv")
clean_data.index = clean_data["Unnamed: 0"]
del(clean_data["Unnamed: 0"])
mins = clean_data.min()
maxes = clean_data.max()
add_on = pd.concat([mins, maxes], axis=1).transpose()
add_on.index = ["min", "max"]
clean_data = pd.concat([clean_data, add_on], axis=0)
clean_data.to_json("literacy_data.json")