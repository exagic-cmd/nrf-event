// components/ItineraryPDF.jsx
import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    PDFDownloadLink
  } from '@react-pdf/renderer';
  
  const styles = StyleSheet.create({
    page: {
      padding: 25,
      backgroundColor: '#f8fafc',
      fontFamily: 'Helvetica'
    },
    header: {
      marginBottom: 25,
      padding: 15,
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      color: 'white',
      textAlign: 'center'
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4
    },
    subtitle: {
      fontSize: 10,
      opacity: 0.9,
      marginTop: 4
    },
    dayContainer: {
      marginBottom: 20,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 15,
      border: '1px solid #e2e8f0'
    },
    dayTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#4f46e5',
      marginBottom: 12,
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: 6
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 8,
      textTransform: 'uppercase'
    },
    activityCard: {
      flexDirection: 'row',
      marginBottom: 10,
      backgroundColor: '#f8fafc',
      borderRadius: 6,
      overflow: 'hidden'
    },
    image: {
      width: 100,
      height: 100,
      objectFit: 'cover'
    },
    content: {
      padding: 12,
      flex: 1
    },
    timeBadge: {
      backgroundColor: '#4f46e5',
      color: 'white',
      fontSize: 9,
      padding: '2px 8px',
      borderRadius: 12,
      marginBottom: 6,
      alignSelf: 'flex-start'
    },
    table: {
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 12
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1px solid #e2e8f0'
    },
    tableHeader: {
      backgroundColor: '#4f46e5',
      color: 'white',
      fontWeight: 'bold'
    },
    tableCell: {
      padding: 10,
      fontSize: 10,
      flex: 1
    },
    transferCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 6,
      border: '1px solid #e2e8f0',
      marginBottom: 8
    }
  });

  const handleImageError = (error) => {
    error.target.src = '/placeholder.svg?height=40&width=40';
  };
  
  const ItineraryPDF = ({ itineraryData }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{itineraryData.trip_title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
            <Text style={styles.subtitle}>{itineraryData.country}</Text>
            <Text style={styles.subtitle}>{itineraryData.total_days} Days</Text>
            <Text style={styles.subtitle}>{itineraryData.total_duration}</Text>
          </View>
        </View>
  
        {itineraryData.itinerary.map((day) => (
          <View key={day.day_number} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>Day {day.day_number} • {day.date}</Text>
  
            {/* Enhanced Activities Section */}
            {day.activities?.map((activity, idx) => (
              <View key={idx} style={styles.activityCard}>
                {activity.image && (
                  <Image
                    src={activity.image}
                    style={styles.image}
                    onError={handleImageError}
                  />
                )}
                <View style={styles.content}>
                  <Text style={styles.timeBadge}>
                    {activity.start_time} - {activity.end_time}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                    {activity.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                    {activity.short_desc}
                  </Text>
                </View>
              </View>
            ))}
  
            {/* Enhanced Accommodation Section */}
            {day.accommodation && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Accommodation</Text>
                <View style={styles.activityCard}>
                  <View style={styles.content}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                      {day.accommodation.hotel_name}
                    </Text>
                    <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 6 }}>
                      {day.accommodation.address}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 15, marginTop: 8 }}>
                      <Text style={{ fontSize: 9, color: '#4f46e5' }}>
                        Check-in: {day.accommodation.check_in}
                      </Text>
                      <Text style={{ fontSize: 9, color: '#4f46e5' }}>
                        Check-out: {day.accommodation.check_out}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
  
            {/* Enhanced Meals Section */}
            {day.meals && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Meals</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, { flex: 0.3 }]}>MEAL</Text>
                    <Text style={styles.tableCell}>RESTAURANT</Text>
                    <Text style={styles.tableCell}>CUISINE</Text>
                  </View>
                  {Object.entries(day.meals).map(([mealType, mealDetails]) => (
                    mealDetails && (
                      <View key={mealType} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 0.3, fontWeight: 'bold' }]}>
                          {mealType.toUpperCase()}
                        </Text>
                        <Text style={styles.tableCell}>{mealDetails.restaurant}</Text>
                        <Text style={[styles.tableCell, { color: '#4f46e5' }]}>
                          {mealDetails.cuisine}
                        </Text>
                      </View>
                    )
                  ))}
                </View>
              </View>
            )}
  
            {/* Enhanced Transfers Section */}
            {day.transfers?.length > 0 && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Transfers</Text>
                {day.transfers.map((transfer, idx) => (
                  <View key={idx} style={styles.transferCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>
                        {transfer.type}
                      </Text>
                      <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>
                        {transfer.pickup_location} → {transfer.dropoff_location}
                      </Text>
                      <Text style={{ fontSize: 9, color: '#4f46e5' }}>
                        {transfer.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
  
  export default ItineraryPDF;