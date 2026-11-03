package com.parkease.model;

/**
 * Model representing a parking centre / hub.
 */
public class ParkingCentre {
    private String id;
    private String name;
    private String city;
    private String locality;
    private String address;
    private String landmark;
    private String phone;
    private int totalSlots = 50;
    private double rating;
    private int reviewsCount;
    private double latitude;
    private double longitude;
    private String openingHours;
    private boolean is24x7;
    private double tariffBike;
    private double tariffCar;
    private double tariffTruck;
    private String amenities;

    public ParkingCentre() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public boolean isIs24x7() { return is24x7; }
    public void setIs24x7(boolean is24x7) { this.is24x7 = is24x7; }

    public double getTariffBike() { return tariffBike; }
    public void setTariffBike(double tariffBike) { this.tariffBike = tariffBike; }

    public double getTariffCar() { return tariffCar; }
    public void setTariffCar(double tariffCar) { this.tariffCar = tariffCar; }

    public double getTariffTruck() { return tariffTruck; }
    public void setTariffTruck(double tariffTruck) { this.tariffTruck = tariffTruck; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}
