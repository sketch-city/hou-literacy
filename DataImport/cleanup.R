require(jsonlite)
#Begin by importing raw data
clean_data = function(df){
  remove_cols = c("OBJECTID", "OBJECTID_1", "STATE", "Total")
  return(df[!(names(df) %in% remove_cols)])
}
censusData = clean_data(read.csv("DataImport/Census_2010_Tracts.csv"))
householdIncome = clean_data(read.csv("DataImport/Median_Household_Income_by_Census_Block_Group_2010.csv"))
homeValue = clean_data(read.csv("DataImport/Median_House_Value_by_Census_Block_Group_2010.csv"))
langData = clean_data(read.csv("DataImport/Language_Spoken_at_Home_by_Census_Block_Group_2010.csv"))
edData = clean_data(read.csv("DataImport/Educational_Attainment_by_Census_Block_Group_2010.csv"))
#Merge where possible
merge_frames = function(x, y){
  merge(x, y, by=intersect(names(x), names(y)), all=1)
}

clean_data = merge_frames(householdIncome, homeValue)
clean_data = merge_frames(clean_data, langData)
clean_data = merge_frames(clean_data, edData)
write.csv(clean_data, "clean_data.csv")
#Prepare a JSON file with block data
write(toJSON(clean_data), "literacy_data.json")
