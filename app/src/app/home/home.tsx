import { useCallback, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { CoffeeCard } from "@/components/coffee-card";
import { CoffeeSearchBar } from "@/components/coffee-search-bar";
import { ScreenContent } from "@/components/screen-content";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, CoffeePalette, Spacing } from "@/constants/theme";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CoffeeOrderBy } from "@/modules/coffee/model/coffee-search-filters";
import { fetchProducts } from "@/modules/coffee/store/products.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { items, status, error, pagination, loadingMore } = useAppSelector(
    (state) => state.products,
  );

  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<CoffeeOrderBy | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 500);

  const loadProducts = useCallback(() => {
    dispatch(
      fetchProducts({
        name: debouncedSearch,
        orderBy,
        page: 1,
        limit: PAGE_SIZE,
      }),
    );
  }, [dispatch, debouncedSearch, orderBy]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchProducts({
          name: debouncedSearch,
          orderBy,
          page: 1,
          limit: PAGE_SIZE,
        }),
      ).unwrap();
    } catch {
      // error is already stored in the products slice
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, debouncedSearch, orderBy]);

  const handleLoadMore = useCallback(() => {
    if (!pagination || loadingMore || status === "loading") return;
    if (pagination.page >= pagination.totalPages) return;

    dispatch(
      fetchProducts({
        name: debouncedSearch,
        orderBy,
        page: pagination.page + 1,
        limit: PAGE_SIZE,
      }),
    );
  }, [dispatch, pagination, loadingMore, status, debouncedSearch, orderBy]);

  const totalCount = pagination?.total ?? items.length;
  const isLoading = status === "loading" || status === "idle";
  const showInitialLoader = isLoading && items.length === 0 && !refreshing;
  const isFailed = status === "failed";
  const listBottomPadding = insets.bottom + BottomTabInset + Spacing.three;

  return (
    <ThemedView style={styles.container}>
      <ScreenContent>
        <ThemedView>
        <Image
          source={require("../../../assets/images/home-bg.png")}
          contentFit="cover"
          style={styles.image}
          blurRadius={5}
        />
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Descubre un nuevo café
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Explora, aprende y conoce los diversos cafés de la región.
          </ThemedText>
        </View>
      </ThemedView>
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <CoffeeSearchBar
          search={search}
          onChangeSearch={setSearch}
          orderBy={orderBy}
          onChangeOrderBy={setOrderBy}
        />
        <ThemedView style={styles.subtitleContainer}>
          <Image
            source={require("../../../assets/icon/icon.png")}
            contentFit="cover"
            style={styles.icon}
          />
          <ThemedText type="small" style={styles.subtitle}>
            {showInitialLoader
              ? "Cargando cafés..."
              : `${totalCount} cafés disponibles`}
          </ThemedText>
        </ThemedView>
        {showInitialLoader ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={CoffeePalette.forest} />
          </View>
        ) : isFailed ? (
          <View style={styles.centered}>
            <ThemedText type="default" style={styles.errorText}>
              {error ?? "No se pudieron cargar los cafés"}
            </ThemedText>
            <Pressable style={styles.retryButton} onPress={loadProducts}>
              <ThemedText type="small" style={styles.retryText}>
                Reintentar
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: listBottomPadding },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={CoffeePalette.forest}
                colors={[CoffeePalette.forest]}
              />
            }
            ListEmptyComponent={
              <ThemedText type="default" style={styles.emptyText}>
                No se encontraron cafés
              </ThemedText>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={CoffeePalette.forest} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.cardCell}>
                <CoffeeCard coffee={item} />
              </View>
            )}
          />
        )}
      </SafeAreaView>
      </ScreenContent>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CoffeePalette.cream,
  },
  safeArea: {
    flex: 1,
    marginTop: -Spacing.four,
    padding: Spacing.three,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    backgroundColor: CoffeePalette.warmWhite,
  },
  titleContainer: {
    zIndex: 1,
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
    position: "absolute",
    top: 0,
    left: 0,
    gap: Spacing.two,
  },
  icon: {
    width: 20,
    height: 20,
  },
  image: {
    width: "100%",
    height: 250,
  },
  columnWrapper: {
    gap: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
  },
  cardCell: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
  },
  title: {
    color: CoffeePalette.forest,
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 40,
    width: "70%",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: CoffeePalette.forest,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    marginBottom: Spacing.three,
  },
  subtitle: {
    color: CoffeePalette.warmWhite,
    fontSize: 16,
    lineHeight: 24,
    width: "60%",
  },
  errorText: {
    color: CoffeePalette.forest,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.three,
    backgroundColor: CoffeePalette.forest,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  retryText: {
    color: CoffeePalette.warmWhite,
  },
  emptyText: {
    color: CoffeePalette.forest,
    textAlign: "center",
    paddingVertical: Spacing.six,
  },
  footerLoader: {
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
});
