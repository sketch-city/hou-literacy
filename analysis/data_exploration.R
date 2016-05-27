clean_data = read.csv("clean_data.csv")
#Examining vacancy rates
clean_data$prop_vacant = clean_data$SUM_Vacant/(clean_data$SUM_TotHou+1e-25)
plot(clean_data$prop_vacant, log(clean_data$Median_HHI))
plot(clean_data$prop_vacant, log(clean_data$Median_House_Value))
