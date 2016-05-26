#Begin by importing raw data
clean_data = function(df){
  remove_cols = c("OBJECTID", "OBJECTID_1", "STATE", "Total")
  return(df[!(names(df) %in% remove_cols)])
}
raw_censusData = clean_data(read.csv("DataImport/Census_2010_Tracts.csv"))
raw_householdIncome = clean_data(read.csv("DataImport/Median_Household_Income_by_Census_Block_Group_2010.csv"))
raw_homeValue = clean_data(read.csv("DataImport/Median_House_Value_by_Census_Block_Group_2010.csv"))
raw_langData = clean_data(read.csv("DataImport/Language_Spoken_at_Home_by_Census_Block_Group_2010.csv"))
raw_edData = clean_data(read.csv("DataImport/Educational_Attainment_by_Census_Block_Group_2010.csv"))
#Merge where possible
merge_frames = function(x, y){
  merge(x, y, by=intersect(names(x), names(y)), all=1)
}

clean_data = merge_frames(raw_householdIncome, raw_homeValue)
clean_data = merge_frames(clean_data, raw_langData)
clean_data = merge_frames(clean_data, raw_edData)
write.csv(clean_data, "clean_data.csv")